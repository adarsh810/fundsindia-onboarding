import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
const USER_ID = process.env.APP_USER_ID ?? 'fi-adarsh';

export async function GET(req: NextRequest) {
  const topicId = req.nextUrl.searchParams.get('topicId');
  if (!topicId) return NextResponse.json({ progress: {} });

  const { data } = await supabase
    .from('fi_resource_progress')
    .select('resource_label, done')
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId);

  const progress: Record<string, boolean> = {};
  for (const row of data ?? []) progress[row.resource_label] = row.done;
  return NextResponse.json({ progress });
}

export async function POST(req: NextRequest) {
  const { topicId, resourceLabel, done, totalResources, currentTopicStatus } = await req.json();
  if (!topicId || !resourceLabel || done === undefined)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  await supabase
    .from('fi_resource_progress')
    .upsert(
      { user_id: USER_ID, topic_id: topicId, resource_label: resourceLabel, done, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,topic_id,resource_label' },
    );

  // Fetch all done counts to compute new topic status
  const { data } = await supabase
    .from('fi_resource_progress')
    .select('done')
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId);

  const doneCount = (data ?? []).filter(r => r.done).length;
  let newStatus: string | null = null;

  if (doneCount >= totalResources && totalResources > 0) {
    newStatus = 'done';
  } else if (doneCount > 0 && currentTopicStatus === 'not_started') {
    newStatus = 'in_progress';
  } else if (doneCount > 0 && currentTopicStatus === 'done') {
    newStatus = 'in_progress';
  } else if (doneCount === 0 && currentTopicStatus === 'done') {
    newStatus = 'in_progress';
  }

  if (newStatus) {
    await supabase
      .from('fi_topic_progress')
      .upsert(
        { user_id: USER_ID, topic_id: topicId, status: newStatus, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,topic_id' },
      );
  }

  return NextResponse.json({ doneCount, newStatus });
}
