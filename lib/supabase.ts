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

export type MetaOverride = { title?: string; desc?: string };
export type MetaOverrideMap = Record<string, MetaOverride>;

export async function getAllMetaOverrides(): Promise<MetaOverrideMap> {
  const { data, error } = await supabase
    .from('fi_topic_meta_override')
    .select('topic_id, title, desc')
    .eq('user_id', USER_ID);
  if (error || !data) return {};
  return Object.fromEntries(
    data.map(r => [r.topic_id, { title: r.title ?? undefined, desc: r.desc ?? undefined }]),
  );
}

export async function setMetaOverride(topicId: string, patch: MetaOverride): Promise<void> {
  await supabase.from('fi_topic_meta_override').upsert(
    {
      user_id: USER_ID,
      topic_id: topicId,
      title: patch.title ?? null,
      desc: patch.desc ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' },
  );
}

export async function clearMetaOverride(topicId: string): Promise<void> {
  await supabase
    .from('fi_topic_meta_override')
    .delete()
    .eq('user_id', USER_ID)
    .eq('topic_id', topicId);
}

export async function setTopicHidden(topicId: string, hidden: boolean): Promise<void> {
  await supabase.from('fi_topic_meta_override').upsert(
    { user_id: USER_ID, topic_id: topicId, hidden, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,topic_id' },
  );
}

export async function getHiddenTopics(): Promise<Set<string>> {
  const { data } = await supabase
    .from('fi_topic_meta_override')
    .select('topic_id')
    .eq('user_id', USER_ID)
    .eq('hidden', true);
  return new Set((data ?? []).map(r => r.topic_id as string));
}

// ─── L1 track overrides ──────────────────────────────────────────────────────

export type L1Override = { label?: string; hidden?: boolean };
export type L1OverrideMap = Record<string, L1Override>; // keyed by l1_id

export async function getAllL1Overrides(section: string): Promise<L1OverrideMap> {
  const { data } = await supabase
    .from('fi_l1_meta_override')
    .select('l1_id, label, hidden')
    .eq('user_id', USER_ID)
    .eq('section', section);
  return Object.fromEntries(
    (data ?? []).map(r => [r.l1_id as string, { label: r.label ?? undefined, hidden: r.hidden ?? false }]),
  );
}

export async function setL1Override(section: string, l1Id: string, patch: L1Override): Promise<void> {
  await supabase.from('fi_l1_meta_override').upsert(
    { user_id: USER_ID, section, l1_id: l1Id, ...patch, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,section,l1_id' },
  );
}

// ─── Custom L1 tracks ────────────────────────────────────────────────────────

export interface CustomL1Track {
  id: string;
  label: string;
  color: string;
  accent: string;
  position: number;
}

export async function getCustomL1Tracks(section: string): Promise<CustomL1Track[]> {
  const { data } = await supabase
    .from('fi_l1_custom')
    .select('id, label, color, accent, position')
    .eq('user_id', USER_ID)
    .eq('section', section)
    .order('position');
  return (data ?? []) as CustomL1Track[];
}

export async function addCustomL1Track(
  section: string,
  label: string,
  color: string,
  accent: string,
  position: number,
): Promise<CustomL1Track | null> {
  const { data } = await supabase
    .from('fi_l1_custom')
    .insert({ user_id: USER_ID, section, label, color, accent, position })
    .select('id, label, color, accent, position')
    .single();
  return data as CustomL1Track | null;
}

export async function deleteCustomL1Track(id: string): Promise<void> {
  await supabase.from('fi_l1_custom').delete().eq('id', id).eq('user_id', USER_ID);
}

// ─── Custom L2 topics ────────────────────────────────────────────────────────

export interface CustomTopic {
  id: string;
  l1Id: string;
  category: string;
  title: string;
  desc: string;
  hours: number;
  week: string;
  done: string;
  artifact: string;
  position: number;
  hidden: boolean;
}

export async function getCustomTopics(section: string): Promise<CustomTopic[]> {
  const { data } = await supabase
    .from('fi_topic_custom')
    .select('id, l1_id, category, title, desc, hours, week, done, artifact, position, hidden')
    .eq('user_id', USER_ID)
    .eq('section', section)
    .eq('hidden', false)
    .order('position');
  return (data ?? []).map(r => ({
    id: r.id as string,
    l1Id: r.l1_id as string,
    category: r.category as string,
    title: r.title as string,
    desc: r.desc as string,
    hours: r.hours as number,
    week: r.week as string,
    done: r.done as string,
    artifact: r.artifact as string,
    position: r.position as number,
    hidden: r.hidden as boolean,
  }));
}

export async function addCustomTopic(
  section: string,
  l1Id: string,
  category: string,
  title: string,
  desc: string,
  hours: number,
): Promise<CustomTopic | null> {
  const { data } = await supabase
    .from('fi_topic_custom')
    .insert({ user_id: USER_ID, section, l1_id: l1Id, category, title, desc, hours, week: 'W1' })
    .select('id, l1_id, category, title, desc, hours, week, done, artifact, position, hidden')
    .single();
  if (!data) return null;
  return {
    id: data.id as string, l1Id: data.l1_id as string, category: data.category as string,
    title: data.title as string, desc: data.desc as string, hours: data.hours as number,
    week: data.week as string, done: data.done as string, artifact: data.artifact as string,
    position: data.position as number, hidden: data.hidden as boolean,
  };
}

export async function getCustomTopicById(id: string): Promise<CustomTopic | null> {
  const { data } = await supabase
    .from('fi_topic_custom')
    .select('id, l1_id, category, title, desc, hours, week, done, artifact, position, hidden')
    .eq('id', id)
    .single();
  if (!data) return null;
  return {
    id: data.id as string, l1Id: data.l1_id as string, category: data.category as string,
    title: data.title as string, desc: data.desc as string, hours: data.hours as number,
    week: data.week as string, done: data.done as string, artifact: data.artifact as string,
    position: data.position as number, hidden: data.hidden as boolean,
  };
}

export async function hideCustomTopic(id: string): Promise<void> {
  await supabase.from('fi_topic_custom').update({ hidden: true }).eq('id', id).eq('user_id', USER_ID);
}

export async function hideCustomTopicsByL1(l1Id: string): Promise<void> {
  await supabase.from('fi_topic_custom').update({ hidden: true }).eq('l1_id', l1Id).eq('user_id', USER_ID);
}

export async function getResourceDoneCount(topicIds: string[]): Promise<number> {
  if (!topicIds.length) return 0;
  const { count } = await supabase
    .from('fi_resource_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', USER_ID)
    .eq('done', true)
    .in('topic_id', topicIds);
  return count ?? 0;
}
