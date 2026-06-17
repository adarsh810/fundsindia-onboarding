import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { YoutubeTranscript } from 'youtube-transcript';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const USER_ID = process.env.APP_USER_ID ?? 'fi-adarsh';
const CONTENT_LIMIT = 9000;

function extractVideoId(url: string): string | null {
  const m =
    url.match(/youtube\.com\/watch\?v=([^&\s]+)/) ??
    url.match(/youtu\.be\/([^?&\s]+)/) ??
    url.match(/youtube\.com\/embed\/([^?&\s]+)/);
  return m?.[1] ?? null;
}

function isYouTubeChannel(url: string): boolean {
  return /youtube\.com\/@|youtube\.com\/channel\/|youtube\.com\/user\/|youtube\.com\/playlist/.test(url);
}

async function fetchContent(url: string): Promise<{ content: string; type: 'youtube' | 'web' }> {
  const videoId = extractVideoId(url);

  if (videoId) {
    try {
      let segments;
      try {
        segments = await YoutubeTranscript.fetchTranscript(videoId);
      } catch {
        segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      }
      const text = segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').slice(0, CONTENT_LIMIT);
      if (text.trim()) return { content: text, type: 'youtube' };
    } catch {
      // fall through to Jina
    }
    // Jina can extract YouTube transcript/description when the package fails
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error('Could not fetch transcript or page content');
    const text = (await res.text()).slice(0, CONTENT_LIMIT);
    if (!text.trim()) throw new Error('No content available for this video');
    return { content: text, type: 'youtube' };
  }

  const res = await fetch(`https://r.jina.ai/${url}`, {
    headers: { Accept: 'text/plain', 'X-No-Cache': 'true' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Could not fetch page (${res.status})`);
  const text = (await res.text()).slice(0, CONTENT_LIMIT);
  return { content: text, type: 'web' };
}

export async function GET(req: NextRequest) {
  const topicId = req.nextUrl.searchParams.get('topicId');
  if (!topicId) return NextResponse.json({ summaries: [] });

  const { data } = await supabase
    .from('fi_resource_summaries')
    .select('resource_url, resource_label, bullets, sections, generated_at')
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId)
    .order('generated_at', { ascending: false });

  return NextResponse.json({ summaries: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { topicId, resourceUrl, resourceLabel } = await req.json();
  if (!topicId || !resourceUrl || !resourceLabel)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  if (isYouTubeChannel(resourceUrl))
    return NextResponse.json({ error: 'Channel/playlist URLs cannot be summarised — link to a specific video instead' }, { status: 422 });

  let content: string;
  let sourceType: string;
  try {
    const result = await fetchContent(resourceUrl);
    content = result.content;
    sourceType = result.type;
  } catch (e: unknown) {
    return NextResponse.json({ error: (e instanceof Error ? e.message : 'Failed to fetch resource') }, { status: 422 });
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are distilling a learning resource into its core ideas, organised by theme.

Resource: "${resourceLabel}"
Source type: ${sourceType === 'youtube' ? 'YouTube video transcript' : 'article/documentation'}

Identify up to 5 natural sections or themes in the content. Format your response exactly like this:

## Section Title
- Bullet one
- Bullet two
- Bullet three

## Another Section
- Bullet one
- Bullet two

Rules:
- Each section gets a crisp title (2–5 words) on a ## heading line
- 3–5 bullets per section, each starting with -
- Each bullet is one complete idea expressed plainly and confidently
- Prioritise insight and essence over detail or specifics
- No filler phrases like "the author explains" or "this section covers"
- No other text — just the ## headings and - bullets

Content:
${content}`,
    }],
  });

  interface Section { title: string; bullets: string[] }

  function parseMarkdownSections(md: string): Section[] {
    const result: Section[] = [];
    const parts = md.split(/^## /m).filter(s => s.trim());
    for (const part of parts) {
      const lines = part.trim().split('\n');
      const title = lines[0].trim();
      const bullets = lines.slice(1)
        .map(l => l.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean);
      if (title && bullets.length) result.push({ title, bullets });
    }
    return result;
  }

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
  const sections = parseMarkdownSections(raw);
  if (!sections.length) {
    return NextResponse.json({ error: 'Failed to parse Claude response' }, { status: 500 });
  }
  const bullets = sections.flatMap(s => s.bullets);

  const { data, error } = await supabase
    .from('fi_resource_summaries')
    .upsert(
      { user_id: USER_ID, topic_id: topicId, resource_url: resourceUrl, resource_label: resourceLabel, bullets, sections, generated_at: new Date().toISOString() },
      { onConflict: 'user_id,topic_id,resource_url' },
    )
    .select('resource_url, resource_label, bullets, sections, generated_at')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Failed to save summary' }, { status: 500 });
  return NextResponse.json({ summary: data });
}

export async function PATCH(req: NextRequest) {
  const { topicId, resourceUrl, bullets } = await req.json();
  if (!topicId || !resourceUrl || !Array.isArray(bullets))
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await supabase
    .from('fi_resource_summaries')
    .update({ bullets, sections: null })
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId)
    .eq('resource_url', resourceUrl)
    .select('resource_url, resource_label, bullets, sections, generated_at')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  return NextResponse.json({ summary: data });
}
