import { createClient } from '@supabase/supabase-js';
import type { ProgressMap, Status } from './types';
import type { OverrideMap, Position } from './schedule';

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

export async function getAllScheduleOverrides(): Promise<OverrideMap> {
  const { data, error } = await supabase
    .from('fi_topic_week_override')
    .select('topic_id, positions')
    .eq('user_id', USER_ID);
  if (error || !data) return {};
  return Object.fromEntries(data.map(r => [r.topic_id, r.positions as Position[]]));
}

export async function setScheduleOverride(topicId: string, positions: Position[]): Promise<void> {
  await supabase.from('fi_topic_week_override').upsert(
    { user_id: USER_ID, topic_id: topicId, positions, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,topic_id' },
  );
}
