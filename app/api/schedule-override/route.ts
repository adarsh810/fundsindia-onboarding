import { NextRequest, NextResponse } from 'next/server';
import { setScheduleOverride } from '@/lib/supabase';
import type { Position } from '@/lib/schedule';

export async function POST(req: NextRequest) {
  const { topicId, positions } = (await req.json()) as {
    topicId?: string;
    positions?: Position[];
  };
  if (!topicId || !Array.isArray(positions)) {
    return NextResponse.json({ error: 'Missing topicId or positions' }, { status: 400 });
  }
  for (const p of positions) {
    if (!p || typeof p.week !== 'string' || (p.side !== 'weekday' && p.side !== 'weekend')) {
      return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
    }
  }
  await setScheduleOverride(topicId, positions);
  return NextResponse.json({ ok: true });
}
