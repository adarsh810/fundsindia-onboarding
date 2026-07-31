import { NextRequest, NextResponse } from 'next/server';
import { setMetaOverride, clearMetaOverride } from '@/lib/supabase';
import { findTopicById } from '@/lib/data';

const MAX_TITLE = 140;
const MAX_DESC = 400;

export async function POST(req: NextRequest) {
  const { topicId, title, desc, reset } = (await req.json()) as {
    topicId?: string;
    title?: string;
    desc?: string;
    reset?: boolean;
  };

  if (!topicId) return NextResponse.json({ error: 'Missing topicId' }, { status: 400 });
  const base = findTopicById(topicId);
  if (!base) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });

  if (reset) {
    await clearMetaOverride(topicId);
    return NextResponse.json({ ok: true, title: base.title, desc: base.desc });
  }

  const cleanTitle = typeof title === 'string' ? title.trim().slice(0, MAX_TITLE) : undefined;
  const cleanDesc = typeof desc === 'string' ? desc.trim().slice(0, MAX_DESC) : undefined;

  const patch = {
    title: cleanTitle === base.title ? undefined : cleanTitle,
    desc: cleanDesc === base.desc ? undefined : cleanDesc,
  };

  if (!patch.title && !patch.desc) {
    await clearMetaOverride(topicId);
    return NextResponse.json({ ok: true, title: base.title, desc: base.desc });
  }

  await setMetaOverride(topicId, patch);
  return NextResponse.json({
    ok: true,
    title: patch.title ?? base.title,
    desc: patch.desc ?? base.desc,
  });
}
