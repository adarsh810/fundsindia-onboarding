import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const USER_ID = process.env.APP_USER_ID ?? 'fi-adarsh';

export async function GET(req: NextRequest) {
  const topicId = req.nextUrl.searchParams.get('topicId');
  if (!topicId) return NextResponse.json({ config: null });

  const { data } = await supabase
    .from('fi_resource_config')
    .select('primary_resources, additional_resources')
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId)
    .single();

  return NextResponse.json({ config: data ?? null });
}

export async function POST(req: NextRequest) {
  const { topicId, primary, additional } = await req.json();
  if (!topicId) return NextResponse.json({ error: 'Missing topicId' }, { status: 400 });

  await supabase
    .from('fi_resource_config')
    .upsert(
      {
        user_id: USER_ID,
        topic_id: topicId,
        primary_resources: primary,
        additional_resources: additional,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,topic_id' },
    );

  return NextResponse.json({ ok: true });
}
