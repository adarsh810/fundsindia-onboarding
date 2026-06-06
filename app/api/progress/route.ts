import { NextResponse } from 'next/server';
import { getAllProgress, setTopicStatus } from '@/lib/supabase';
import type { Status } from '@/lib/types';

export async function GET() {
  const progress = await getAllProgress();
  return NextResponse.json(progress);
}

export async function POST(req: Request) {
  const { topicId, status } = await req.json() as { topicId: string; status: Status };
  if (!topicId || !['not_started', 'in_progress', 'done'].includes(status))
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  await setTopicStatus(topicId, status);
  return NextResponse.json({ ok: true });
}
