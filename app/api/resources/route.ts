import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { findTopicById } from '@/lib/data';
import type { GeneratedResource } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const USER_ID = process.env.APP_USER_ID ?? 'fi-adarsh';

export async function GET(req: NextRequest) {
  const topicId = req.nextUrl.searchParams.get('topicId');
  if (!topicId) return NextResponse.json({ batches: [] });

  const { data, error } = await supabase
    .from('fi_generated_resources')
    .select('id, resources, generated_at')
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId)
    .order('generated_at', { ascending: false });

  if (error || !data) return NextResponse.json({ batches: [] });
  return NextResponse.json({ batches: data });
}

export async function POST(req: NextRequest) {
  const { topicId } = await req.json();
  if (!topicId) return NextResponse.json({ error: 'Missing topicId' }, { status: 400 });

  const topic = findTopicById(topicId);
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

  const existingLabels = topic.resources.map(r => `- ${r.label}`).join('\n');

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are helping a product manager learn "${topic.title}" — ${topic.desc}.

Existing resources they already have:
${existingLabels}

Generate 5 additional high-quality learning resources different from the above. Mix of videos, articles, docs, books, or tools. Prefer accessible, well-regarded sources. For YouTube videos use full watch URLs. For articles use direct post URLs.

Return a JSON array only, no other text:
[
  { "label": "Author/Source — Title", "url": "https://...", "type": "video" | "article" | "doc" | "book" | "tool" }
]`,
      },
    ],
  });

  let resources: GeneratedResource[] = [];
  try {
    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    resources = JSON.parse(text.slice(jsonStart, jsonEnd));
  } catch {
    return NextResponse.json({ error: 'Failed to parse response' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('fi_generated_resources')
    .insert({ user_id: USER_ID, topic_id: topicId, resources, generated_at: new Date().toISOString() })
    .select('id, resources, generated_at')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  return NextResponse.json({ batch: data });
}
