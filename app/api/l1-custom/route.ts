import { NextRequest, NextResponse } from 'next/server';
import { addCustomL1Track, deleteCustomL1Track, hideCustomTopicsByL1 } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { action, section, label, color, accent, position, id } = (await req.json()) as {
    action: 'add' | 'delete'; section?: string; label?: string;
    color?: string; accent?: string; position?: number; id?: string;
  };
  if (action === 'add') {
    if (!section || !label) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    const track = await addCustomL1Track(
      section, label.trim().slice(0, 80),
      color ?? '#6B3FA0', accent ?? '#D7BDE2', position ?? 99,
    );
    return NextResponse.json({ ok: true, track });
  }
  if (action === 'delete') {
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await Promise.all([deleteCustomL1Track(id), hideCustomTopicsByL1(id)]);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
