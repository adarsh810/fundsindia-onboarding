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
      content: `You are distilling a learning resource into its essential ideas.

Resource: "${resourceLabel}"
Source type: ${sourceType === 'youtube' ? 'YouTube video transcript' : 'article/documentation'}

Your job:
- Detect the natural emergent topics in the content honestly. This may be 1, 2, or at most 3-4. Do not force a topic count. Most resources have 1-3 real topics; anything more usually means you are inventing structure that isn't there.
- For each topic, extract **exactly 3-4 essential bullets** — the ideas someone actually learns. If you only have 3 genuinely useful ideas, give 3. Never pad to 4.
- If the content is thin (short article, narrow scope, or one clear thesis), a single-topic summary with 3-4 bullets is the correct answer.
- Total bullets across all topics should almost never exceed 12. If yours is heading past that, you are including filler.

Format:
## Topic name
- Bullet one
- Bullet two
- Bullet three

## Next topic (only if there IS a distinct second topic)
- Bullet one
- Bullet two
- Bullet three

Rules:
- Topic titles: 2-5 words, concrete, name what the topic actually is. Never use "Introduction", "Overview", "Conclusion", "Key Points", or any generic label.
- Bullets: one idea per bullet, expressed as if you understood it and are telling a peer at their level. Confident and plain.
- Zero filler phrases ("the author discusses", "this section covers", "in summary", "in conclusion", "notably", "importantly").
- No overlap between topics — if two headings would say similar things, they are one topic.
- If a bullet just restates the topic title or another bullet, drop it.
- Never pad. Fewer sharp bullets beats more padded ones. Every time.
- Output nothing outside ## headings and - bullets. No preamble, no closing.

Content:
${content}`,
    }],
  });

  interface Section { title: string; bullets: string[] }

  function parseMarkdownSections(md: string, fallbackTitle: string): Section[] {
    // Strip code-fence wrappers the model sometimes adds
    let text = md.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:markdown|md)?\s*\n?/i, '').replace(/\n?```\s*$/, '').trim();
    }

    const result: Section[] = [];

    // Tolerant heading match: 1-3 hashes, optional space, ignore trailing spaces
    const parts = text.split(/^#{1,3}\s*/m).filter(s => s.trim());
    for (const part of parts) {
      const lines = part.trim().split('\n');
      const title = lines[0].trim();
      const bullets = lines.slice(1)
        .map(l => l.replace(/^[-*•]\s+/, '').trim())
        .filter(Boolean);
      // Reject titles that look like bullets (edge case when first line has no heading)
      if (title && bullets.length && !/^[-*•]\s/.test(title)) {
        result.push({ title, bullets });
      }
    }

    // Fallback: no proper heading found but bullets exist → wrap under fallback title
    if (result.length === 0) {
      const bullets = text.split('\n')
        .map(l => l.trim())
        .filter(l => /^[-*•]\s+/.test(l))
        .map(l => l.replace(/^[-*•]\s+/, '').trim())
        .filter(Boolean);
      if (bullets.length > 0) {
        result.push({ title: fallbackTitle, bullets });
      }
    }

    return result;
  }

  const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';

  // Detect "the model gave up" responses (thin/refused/apologetic)
  if (raw.length < 60 || /^(i\s|i'm|sorry|there is|there's|the content|the (article|resource|page))/i.test(raw)) {
    console.error('[summarise] Model returned non-summary output for', resourceUrl, ':', raw.slice(0, 200));
    return NextResponse.json({
      error: 'This resource looks thin — the model couldn\'t extract a real summary. Try opening the link to check, or retry.',
    }, { status: 422 });
  }

  const sections = parseMarkdownSections(raw, resourceLabel);
  if (!sections.length) {
    console.error('[summarise] Parse failed for', resourceUrl, '\nRaw:', raw.slice(0, 400));
    return NextResponse.json({
      error: 'The model returned an unexpected format. Retry usually works.',
    }, { status: 502 });
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
  const { topicId, resourceUrl, resourceLabel, bullets } = await req.json();
  if (!topicId || !resourceUrl || !Array.isArray(bullets))
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const { data, error } = await supabase
    .from('fi_resource_summaries')
    .upsert(
      {
        user_id: USER_ID,
        topic_id: topicId,
        resource_url: resourceUrl,
        resource_label: resourceLabel ?? resourceUrl,
        bullets,
        sections: null,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id,resource_url' },
    )
    .select('resource_url, resource_label, bullets, sections, generated_at')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
  return NextResponse.json({ summary: data });
}
