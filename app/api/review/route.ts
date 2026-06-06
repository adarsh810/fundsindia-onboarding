import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { findTopicById, findTrackForTopic } from '@/lib/data';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const { topicId, artifact } = await req.json() as { topicId: string; artifact: string };

  const topic = findTopicById(topicId);
  const track = topic ? findTrackForTopic(topicId) : null;
  if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  if (!artifact?.trim()) return NextResponse.json({ error: 'No artifact text provided' }, { status: 400 });

  const system = `You are reviewing a learning artifact produced as part of a FundsIndia PM onboarding programme.

Topic: "${topic.title}" (${track?.label})
Expected artifact: ${topic.artifact}
Done when: ${topic.done}

Review the submitted artifact against these criteria. Return ONLY valid JSON:
{
  "verdict": "strong" | "solid" | "needs_work",
  "score": 1-10,
  "what_works": ["point 1", "point 2"],
  "gaps": ["gap 1", "gap 2"],
  "one_thing_to_add": "single most impactful improvement",
  "ready_to_move_on": true | false
}`;

  const resp = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: `Here is my artifact:\n\n${artifact.slice(0, 8000)}` }],
  });

  const raw = resp.content.filter(b => b.type === 'text').map(b => b.text).join('');
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return NextResponse.json(JSON.parse(match?.[0] ?? raw));
  } catch {
    return NextResponse.json({ error: 'Parse error', raw }, { status: 500 });
  }
}
