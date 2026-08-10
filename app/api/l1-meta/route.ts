import { NextRequest, NextResponse } from 'next/server';
import { setL1Override } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { section, l1Id, label, hidden } = (await req.json()) as {
    section?: string; l1Id?: string; label?: string; hidden?: boolean;
  };
  if (!section || !l1Id) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  await setL1Override(section, l1Id, {
    label: typeof label === 'string' ? label.trim().slice(0, 80) || undefined : undefined,
    hidden: typeof hidden === 'boolean' ? hidden : undefined,
  });
  return NextResponse.json({ ok: true });
}
