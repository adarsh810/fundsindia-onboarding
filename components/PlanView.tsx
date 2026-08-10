'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOPICS, findTopicById, resolveMeta } from '@/lib/data';
import type { ProgressMap, Status } from '@/lib/types';
import type { MetaOverrideMap, L1OverrideMap, CustomL1Track, CustomTopic } from '@/lib/supabase';
import { SHADOW_RAISED } from '@/lib/elevation';
import { getEffectivePositions, formatEffectiveWeekLabel, type OverrideMap } from '@/lib/schedule';

const CYCLE: Record<Status, Status> = {
  not_started: 'in_progress',
  in_progress: 'done',
  done: 'not_started',
};

const STATUS_STYLE: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  not_started: { bg: '#EEE9E2', text: '#6B6560', dot: '#A89F96', label: 'Not started' },
  in_progress: { bg: '#FEF3D0', text: '#7A5010', dot: '#E6A020', label: 'In progress' },
  done:        { bg: '#D1EDDA', text: '#1B5E2A', dot: '#4CAF65', label: 'Done' },
};

const PALETTE = [
  ['#2D6A4F','#B7E4C7'],['#1B4F72','#AED6F1'],['#6B3FA0','#D7BDE2'],
  ['#B7410E','#FAD7A0'],['#7B68C8','#E8E4FF'],['#1f6f6a','#B4EDE8'],
];

export default function PlanView({
  initialProgress, initialTrack, overrides, metas,
  l1Overrides = {}, customL1Tracks = [], customTopics = [], hiddenTopics = [], section = 'prejoining',
}: {
  initialProgress: ProgressMap; initialTrack?: string; overrides: OverrideMap; metas: MetaOverrideMap;
  l1Overrides?: L1OverrideMap; customL1Tracks?: CustomL1Track[]; customTopics?: CustomTopic[];
  hiddenTopics?: string[]; section?: string;
}) {
  const hidden = new Set(hiddenTopics);
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);

  // Merge static + custom L1 tracks; apply overrides + hidden filter
  type TrackMeta = { id: string; label: string; color: string; accent: string; isCustom?: boolean };
  const initTracks = (): TrackMeta[] => [
    ...TOPICS
      .filter(l => !l1Overrides[l.id]?.hidden)
      .map(l => ({ id: l.id, label: l1Overrides[l.id]?.label ?? l.label, color: l.color, accent: l.accent })),
    ...customL1Tracks.map(c => ({ id: c.id, label: c.label, color: c.color, accent: c.accent, isCustom: true })),
  ];
  const [tracks, setTracks] = useState<TrackMeta[]>(initTracks);
  const validTrack = tracks.find(l => l.id === initialTrack)?.id ?? tracks[0]?.id ?? TOPICS[0].id;
  const [activeTrack, setActiveTrack] = useState<string>(validTrack);

  // L1 rename/add/remove state
  const [editingL1, setEditingL1] = useState<string | null>(null);
  const [editL1Text, setEditL1Text] = useState('');
  const [addingTrack, setAddingTrack] = useState(false);
  const [newTrackLabel, setNewTrackLabel] = useState('');
  const [newTrackColor, setNewTrackColor] = useState(PALETTE[0][0]);
  const [newTrackAccent, setNewTrackAccent] = useState(PALETTE[0][1]);

  // L2 add/remove state
  const [addingTopic, setAddingTopic] = useState<{ l1Id: string; cat: string } | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(2);
  const [localHidden, setLocalHidden] = useState<Set<string>>(hidden);
  const [customTopicsList, setCustomTopicsList] = useState<CustomTopic[]>(customTopics);

  async function saveL1Label(id: string) {
    const t = editL1Text.trim(); if (!t) { setEditingL1(null); return; }
    await fetch('/api/l1-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, l1Id: id, label: t }) });
    setTracks(prev => prev.map(l => l.id === id ? { ...l, label: t } : l));
    setEditingL1(null);
  }

  async function removeL1(id: string, isCustom: boolean) {
    if (!confirm('Remove this track?')) return;
    if (isCustom) {
      await fetch('/api/l1-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }) });
    } else {
      await fetch('/api/l1-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, l1Id: id, hidden: true }) });
    }
    setTracks(prev => { const next = prev.filter(l => l.id !== id); if (activeTrack === id) setActiveTrack(next[0]?.id ?? ''); return next; });
  }

  async function addTrack() {
    const t = newTrackLabel.trim(); if (!t) return;
    const res = await fetch('/api/l1-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', section, label: t, color: newTrackColor, accent: newTrackAccent, position: tracks.length + 1 }) });
    const { track: tr } = await res.json();
    if (tr) setTracks(prev => [...prev, { id: tr.id, label: t, color: newTrackColor, accent: newTrackAccent, isCustom: true }]);
    setNewTrackLabel(''); setAddingTrack(false);
  }

  async function hideTopic(topicId: string, isCustom: boolean) {
    if (isCustom) {
      await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide', customId: topicId }) });
      setCustomTopicsList(prev => prev.filter(t => t.id !== topicId));
    } else {
      await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide', topicId }) });
      setLocalHidden(prev => new Set([...prev, topicId]));
    }
  }

  async function addTopicToTrack() {
    if (!addingTopic || !newTopicTitle.trim()) return;
    const res = await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', section, l1Id: addingTopic.l1Id, category: addingTopic.cat,
        title: newTopicTitle.trim(), desc: '', hours: newTopicHours }) });
    const { topic } = await res.json();
    if (topic) setCustomTopicsList(prev => [...prev, topic as CustomTopic]);
    setNewTopicTitle(''); setNewTopicHours(2); setAddingTopic(null);
  }

  async function cycleStatus(topicId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const current: Status = (progress[topicId] as Status) ?? 'not_started';
    const next = CYCLE[current];
    setProgress(prev => ({ ...prev, [topicId]: next }));
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, status: next }),
    });
  }

  const activeTrackMeta = tracks.find(l => l.id === activeTrack);
  const staticTrack = TOPICS.find(l => l.id === activeTrack);
  const activeColor  = activeTrackMeta?.color ?? '#2D6A4F';
  const activeAccent = activeTrackMeta?.accent ?? '#B7E4C7';

  // Build topics for active track (static + custom, filtered hidden)
  const staticCategories = staticTrack?.categories.map(cat => ({
    name: cat.name,
    topics: cat.topics.filter(t => !localHidden.has(t.id)).map(t => ({
      ...t, title: resolveMeta(t, metas).title, desc: resolveMeta(t, metas).desc, isCustom: false,
    })),
  })) ?? [];
  const customForTrack = customTopicsList.filter(t => t.l1Id === activeTrack);
  const mergedCats = [...staticCategories];
  customForTrack.forEach(ct => {
    let cat = mergedCats.find(c => c.name === ct.category);
    if (!cat) { cat = { name: ct.category, topics: [] }; mergedCats.push(cat); }
    (cat.topics as typeof cat.topics & { isCustom?: boolean }[]).push({
      id: ct.id, title: ct.title, desc: ct.desc, hours: ct.hours, isCustom: true,
      week: ct.week, done: ct.done, artifact: ct.artifact, resources: [],
    } as never);
  });

  const allTopics = mergedCats.flatMap(c => c.topics);
  const doneCount  = allTopics.filter(t => progress[t.id] === 'done').length;
  const inProgCount = allTopics.filter(t => progress[t.id] === 'in_progress').length;
  const pct = allTopics.length ? Math.round((doneCount / allTopics.length) * 100) : 0;

  return (
    <div>
      {/* Track tabs */}
      <div className="flex gap-2 flex-wrap mb-3">
        {tracks.map(l1 => {
          const staticL1 = TOPICS.find(x => x.id === l1.id);
          const l1Topics = (staticL1?.categories.flatMap(c => c.topics).filter(t => !localHidden.has(t.id)) ?? [])
            .concat(customTopicsList.filter(t => t.l1Id === l1.id) as never[]);
          const done = (l1Topics as { id: string }[]).filter(t => progress[t.id] === 'done').length;
          const isActive = activeTrack === l1.id;
          return (
            <div key={l1.id} className="relative group/tab">
              <button
                onClick={() => setActiveTrack(l1.id)}
                className="text-[13px] px-4 py-2 rounded-full border font-medium transition-all active:scale-[0.97] hover:opacity-90"
                style={isActive ? {
                  background: `linear-gradient(135deg, ${l1.color} 0%, ${l1.color}E0 100%)`,
                  color: '#FAF8F5', borderColor: 'transparent',
                  boxShadow: `${SHADOW_RAISED}, 0 4px 16px ${l1.color}35`,
                } : { background: l1.accent, color: l1.color, borderColor: 'transparent' }}
              >
                {editingL1 === l1.id ? (
                  <input autoFocus value={editL1Text} onChange={e => setEditL1Text(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveL1Label(l1.id); if (e.key === 'Escape') setEditingL1(null); }}
                    onBlur={() => saveL1Label(l1.id)}
                    onClick={e => e.stopPropagation()}
                    className="bg-transparent outline-none w-24 font-medium"
                    style={{ color: isActive ? '#FAF8F5' : l1.color }} />
                ) : (
                  <>{l1.label} · {done}/{(l1Topics as unknown[]).length}</>
                )}
              </button>
              {!editingL1 && (
                <div className="absolute -top-1.5 -right-1 hidden group-hover/tab:flex gap-0.5">
                  <button onClick={() => { setEditingL1(l1.id); setEditL1Text(l1.label); }}
                    className="w-4 h-4 rounded-full bg-[#EEE9E2] text-[8px] text-[#4A4540] hover:bg-[#1C1C1A] hover:text-white flex items-center justify-center transition-colors">✎</button>
                  <button onClick={() => removeL1(l1.id, !!l1.isCustom)}
                    className="w-4 h-4 rounded-full bg-[#EEE9E2] text-[8px] text-[#4A4540] hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">✕</button>
                </div>
              )}
            </div>
          );
        })}
        {/* Add track */}
        {addingTrack ? (
          <div className="flex items-center gap-1.5 bg-white border border-[#E8E4DE] rounded-full px-3 py-1">
            <input autoFocus value={newTrackLabel} onChange={e => setNewTrackLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTrack()} placeholder="Track name…"
              className="text-[12px] text-[#1C1C1A] bg-transparent outline-none w-28" />
            <div className="flex gap-0.5">
              {PALETTE.map(([c, a]) => (
                <button key={c} type="button" onClick={() => { setNewTrackColor(c); setNewTrackAccent(a); }}
                  className={`w-3.5 h-3.5 rounded-full border ${newTrackColor === c ? 'border-[#1C1C1A] scale-125' : 'border-transparent'} transition-transform`}
                  style={{ background: c }} />
              ))}
            </div>
            <button onClick={addTrack} disabled={!newTrackLabel.trim()} className="text-[11px] text-[#1C1C1A] font-semibold disabled:opacity-40">✓</button>
            <button onClick={() => setAddingTrack(false)} className="text-[11px] text-[#9B9590]">✕</button>
          </div>
        ) : (
          <button onClick={() => setAddingTrack(true)}
            className="text-[12px] px-3 py-1.5 rounded-full border border-dashed border-[#D8D3CC] text-[#9B9590] hover:border-[#9B9590] hover:text-[#4A4540] transition-colors">
            + Add track
          </button>
        )}
      </div>

      {/* Track summary bar */}
      <div className="bg-white border border-[#E8E4DE] rounded-xl px-5 py-4 mb-4 flex items-center gap-4">
        <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: activeColor }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-[family-name:var(--font-playfair)] text-[15px] font-bold text-[#1C1C1A]">{activeTrackMeta?.label ?? ''}</span>
            <span className="text-[11px] text-[#9B9590]">{allTopics.length} topics</span>
            {inProgCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#FEF3D0', color: '#7A5010' }}>
                {inProgCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-2 bg-[#EEE9E2] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: activeColor }} />
            </div>
            <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{allTopics.length} done</span>
          </div>
        </div>
      </div>

      {/* Topics — flat list grouped by category */}
      <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
        {mergedCats.map((cat, ci) => (
          <div key={cat.name}>
            <div className={`px-5 py-3 bg-[#F5F2EE] flex items-center gap-2 ${ci > 0 ? 'border-t border-[#EEE9E2]' : ''}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B6560]">{cat.name}</p>
              <span className="text-[10px] text-[#C8C2BA]">
                {cat.topics.filter(t => progress[t.id] === 'done').length}/{cat.topics.length}
              </span>
            </div>
            <div className="divide-y divide-[#F5F2EE]">
              {(cat.topics as (typeof cat.topics[0] & { isCustom?: boolean })[]).map(t => {
                const status: Status = (progress[t.id] as Status) ?? 'not_started';
                const s = STATUS_STYLE[status];
                const staticT = findTopicById(t.id);
                return (
                  <div key={t.id} className="group/row flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors">
                    <button
                      onClick={e => cycleStatus(t.id, e)}
                      className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-[0.97]"
                      style={{ borderColor: s.dot, background: status === 'not_started' ? 'transparent' : s.bg }}
                      title={`${s.label} — click to advance`}
                    >
                      {status === 'done' && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {status === 'in_progress' && <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />}
                    </button>

                    <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono"
                      style={{ background: activeAccent, color: activeColor }}>{t.id}</span>

                    <Link href={`/topic/${t.id}`} className="flex-1 min-w-0 group/link">
                      <p className={`text-[13px] font-medium group-hover/link:text-[#000] transition-colors truncate ${status === 'done' ? 'text-[#9B9590] line-through' : 'text-[#1C1C1A]'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-[#9B9590] truncate mt-0.5 hidden sm:block">{t.desc}</p>
                    </Link>

                    <div className="shrink-0 text-right hidden sm:block">
                      {staticT && <p className="text-[11px] text-[#9B9590]">{formatEffectiveWeekLabel(getEffectivePositions(staticT, overrides))}</p>}
                      <p className="text-[11px] font-medium text-[#4A4540]">{t.hours}h</p>
                    </div>

                    <button onClick={() => hideTopic(t.id, !!t.isCustom)}
                      className="opacity-0 group-hover/row:opacity-40 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-red-500 transition-opacity shrink-0"
                      title="Remove topic">✕</button>

                    <svg className="w-3.5 h-3.5 text-[#D5CFC8] group-hover/row:text-[#9B9590] transition-colors shrink-0"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                );
              })}
            </div>
            {/* Add topic to this category */}
            {addingTopic?.l1Id === activeTrack && addingTopic?.cat === cat.name ? (
              <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EEE9E2] flex items-center gap-2">
                <input autoFocus value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTopicToTrack()} placeholder="Topic title…"
                  className="flex-1 text-[12px] bg-white border border-[#D8D3CC] rounded-md px-2 py-1 focus:outline-none focus:border-[#9B9590]" />
                <input type="number" min={1} max={20} value={newTopicHours} onChange={e => setNewTopicHours(Number(e.target.value))}
                  className="w-12 text-[12px] text-center bg-white border border-[#D8D3CC] rounded-md px-1 py-1 focus:outline-none" />
                <span className="text-[11px] text-[#9B9590]">h</span>
                <button onClick={addTopicToTrack} disabled={!newTopicTitle.trim()}
                  className="text-[11px] font-semibold px-2 py-1 rounded bg-[#1C1C1A] text-white disabled:opacity-40">Add</button>
                <button onClick={() => { setAddingTopic(null); setNewTopicTitle(''); }} className="text-[11px] text-[#9B9590]">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setAddingTopic({ l1Id: activeTrack, cat: cat.name })}
                className="w-full text-[11px] text-[#9B9590] hover:text-[#4A4540] py-2 border-t border-[#F5F2EE] hover:bg-[#FAF8F5] transition-colors">
                + Add to {cat.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
