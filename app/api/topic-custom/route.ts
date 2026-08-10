import { NextRequest, NextResponse } from 'next/server';
import { addCustomTopic, hideCustomTopic, setTopicHidden } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    action: 'add' | 'hide' | 'unhide';
    section?: string; l1Id?: string; category?: string;
    title?: string; desc?: string; hours?: number;
    topicId?: string; customId?: string;
  };
  if (body.action === 'add') {
    const { section, l1Id, category, title, desc, hours } = body;
    if (!section || !l1Id || !title) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const topic = await addCustomTopic(
      section, l1Id, category ?? 'Custom',
      title.trim().slice(0, 120), (desc ?? '').trim().slice(0, 300),
      Math.max(1, Math.min(20, hours ?? 2)),
    );
    return NextResponse.json({ ok: true, topic });
  }
  if (body.action === 'hide') {
    if (body.customId) { await hideCustomTopic(body.customId); return NextResponse.json({ ok: true }); }
    if (body.topicId)  { await setTopicHidden(body.topicId, true); return NextResponse.json({ ok: true }); }
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  if (body.action === 'unhide') {
    if (!body.topicId) return NextResponse.json({ error: 'Missing topicId' }, { status: 400 });
    await setTopicHidden(body.topicId, false);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
