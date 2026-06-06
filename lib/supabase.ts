import { createClient } from '@supabase/supabase-js';
import type { ProgressMap, Status } from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export const USER_ID = process.env.APP_USER_ID ?? 'fi-adarsh';

export async function getAllProgress(): Promise<ProgressMap> {
  const { data, error } = await supabase
    .from('fi_topic_progress')
    .select('topic_id, status')
    .eq('user_id', USER_ID);
  if (error || !data) return {};
  return Object.fromEntries(data.map(r => [r.topic_id, r.status as Status]));
}

export async function setTopicStatus(topicId: string, status: Status): Promise<void> {
  await supabase.from('fi_topic_progress').upsert(
    { user_id: USER_ID, topic_id: topicId, status, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,topic_id' },
  );
}
