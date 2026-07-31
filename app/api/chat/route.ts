import Anthropic from '@anthropic-ai/sdk';
import { findTopicById, findTrackForTopic, resolveMeta } from '@/lib/data';
import { getAllMetaOverrides } from '@/lib/supabase';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function POST(req: Request) {
  const { topicId, messages } = await req.json() as {
    topicId: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
  };

  const topic = findTopicById(topicId);
  const track = topic ? findTrackForTopic(topicId) : null;
  if (!topic) return new Response('Topic not found', { status: 404 });

  const metas = await getAllMetaOverrides();
  const { title, desc } = resolveMeta(topic, metas);

  const system = `You are a study companion helping someone learn "${title}" as part of their FundsIndia onboarding preparation.

Topic context:
- Track: ${track?.label}
- Description: ${desc}
- Time allocation: ${topic.hours} hours (${topic.week})
- Resources: ${topic.resources.join(', ')}
- Artifact to produce: ${topic.artifact}
- Done when: ${topic.done}

Your role:
- Explain concepts clearly and concisely — this person is a PM, not an engineer or finance expert
- Use analogies freely; avoid jargon without explanation
- Connect ideas to FundsIndia's context wherever relevant
- When asked to quiz them, ask one focused question at a time
- Keep responses focused — 2–4 paragraphs max unless a longer explanation is genuinely needed
- If they ask about something outside this topic, briefly answer and redirect back`;

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
    cancel() { stream.abort(); },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' },
  });
}
