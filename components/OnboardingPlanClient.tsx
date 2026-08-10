'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { L1Track, ProgressMap } from '@/lib/types';
import type { MetaOverrideMap, L1OverrideMap, CustomL1Track, CustomTopic } from '@/lib/supabase';

const STATUS_DOT: Record<string, string> = {
  not_started: '#C8C2BA', in_progress: '#F4C97A', done: '#6DB07A',
};

const PALETTE = [
  ['#2D6A4F','#B7E4C7'],['#1B4F72','#AED6F1'],['#6B3FA0','#D7BDE2'],
  ['#B7410E','#FAD7A0'],['#7B68C8','#E8E4FF'],['#1f6f6a','#B4EDE8'],
  ['#9a6a16','#FBF2DD'],['#9d2f2f','#F8E7E3'],
];

interface TrackData {
  id: string; label: string; color: string; accent: string; isCustom?: boolean;
  categories: { name: string; topics: { id: string; title: string; desc: string; hours: number; isCustom?: boolean }[] }[];
}

interface Props {
  staticTracks: L1Track[];
  l1Overrides: L1OverrideMap;
  customL1Tracks: CustomL1Track[];
  customTopics: CustomTopic[];
  hiddenTopics: string[];
  progress: ProgressMap;
  metas: MetaOverrideMap;
  section: string;
}

export default function OnboardingPlanClient({
  staticTracks, l1Overrides, customL1Tracks, customTopics, hiddenTopics, progress, metas, section,
}: Props) {
  // Build mutable track list
  const initTracks = (): TrackData[] => {
    const hidden = new Set(hiddenTopics);
    const result: TrackData[] = staticTracks
      .filter(l1 => !l1Overrides[l1.id]?.hidden)
      .map(l1 => ({
        id: l1.id,
        label: l1Overrides[l1.id]?.label ?? l1.label,
        color: l1.color,
        accent: l1.accent,
        categories: l1.categories.map(cat => ({
          name: cat.name,
          topics: cat.topics
            .filter(t => !hidden.has(t.id))
            .map(t => ({
              id: t.id,
              title: metas[t.id]?.title?.trim() || t.title,
              desc: metas[t.id]?.desc?.trim() || t.desc,
              hours: t.hours,
            })),
        })),
      }));
    // Add custom L1 tracks
    customL1Tracks.forEach(c => {
      const cTopics = customTopics.filter(t => t.l1Id === c.id);
      const catMap: Record<string, typeof cTopics> = {};
      cTopics.forEach(t => { (catMap[t.category] ??= []).push(t); });
      result.push({
        id: c.id, label: c.label, color: c.color, accent: c.accent, isCustom: true,
        categories: Object.entries(catMap).map(([name, ts]) => ({
          name,
          topics: ts.map(t => ({ id: t.id, title: t.title, desc: t.desc, hours: t.hours, isCustom: true })),
        })),
      });
    });
    // Inject custom topics into existing static tracks
    customTopics.filter(t => !customL1Tracks.find(c => c.id === t.l1Id)).forEach(ct => {
      const track = result.find(l => l.id === ct.l1Id);
      if (!track) return;
      let cat = track.categories.find(c => c.name === ct.category);
      if (!cat) { cat = { name: ct.category, topics: [] }; track.categories.push(cat); }
      cat.topics.push({ id: ct.id, title: ct.title, desc: ct.desc, hours: ct.hours, isCustom: true });
    });
    return result;
  };

  const [tracks, setTracks] = useState<TrackData[]>(initTracks);
  const [editingL1, setEditingL1] = useState<string | null>(null);
  const [editL1Text, setEditL1Text] = useState('');
  const [addingTrack, setAddingTrack] = useState(false);
  const [newTrackLabel, setNewTrackLabel] = useState('');
  const [newTrackColor, setNewTrackColor] = useState(PALETTE[4][0]);
  const [newTrackAccent, setNewTrackAccent] = useState(PALETTE[4][1]);
  const [addingTopic, setAddingTopic] = useState<{ l1Id: string; cat: string } | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicHours, setNewTopicHours] = useState(2);
  const [saving, setSaving] = useState(false);

  async function saveL1Label(id: string, isCustom: boolean) {
    const t = editL1Text.trim();
    if (!t) { setEditingL1(null); return; }
    setSaving(true);
    if (isCustom) {
      await fetch('/api/l1-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, l1Id: id, label: t }) });
    } else {
      await fetch('/api/l1-meta', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, l1Id: id, label: t }) });
    }
    setTracks(prev => prev.map(l => l.id === id ? { ...l, label: t } : l));
    setEditingL1(null); setSaving(false);
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
    setTracks(prev => prev.filter(l => l.id !== id));
  }

  async function addTrack() {
    const t = newTrackLabel.trim();
    if (!t) return;
    setSaving(true);
    const res = await fetch('/api/l1-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', section, label: t, color: newTrackColor, accent: newTrackAccent, position: tracks.length + 1 }) });
    const { track } = await res.json();
    if (track) setTracks(prev => [...prev, { id: track.id, label: t, color: newTrackColor, accent: newTrackAccent, isCustom: true, categories: [] }]);
    setNewTrackLabel(''); setAddingTrack(false); setSaving(false);
  }

  async function removeTopic(topicId: string, isCustom: boolean, l1Id: string) {
    if (isCustom) {
      await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide', customId: topicId }) });
    } else {
      await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hide', topicId }) });
    }
    setTracks(prev => prev.map(l => l.id !== l1Id ? l : {
      ...l, categories: l.categories.map(c => ({ ...c, topics: c.topics.filter(t => t.id !== topicId) })),
    }));
  }

  async function addTopic() {
    if (!addingTopic || !newTopicTitle.trim()) return;
    setSaving(true);
    const res = await fetch('/api/topic-custom', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', section, l1Id: addingTopic.l1Id, category: addingTopic.cat,
        title: newTopicTitle.trim(), desc: '', hours: newTopicHours }) });
    const { topic } = await res.json();
    if (topic) {
      setTracks(prev => prev.map(l => {
        if (l.id !== addingTopic.l1Id) return l;
        return { ...l, categories: l.categories.map(c => c.name !== addingTopic.cat ? c : {
          ...c, topics: [...c.topics, { id: topic.id, title: topic.title, desc: '', hours: topic.hours, isCustom: true }],
        }) };
      }));
    }
    setNewTopicTitle(''); setNewTopicHours(2); setAddingTopic(null); setSaving(false);
  }

  return (
    <div className="space-y-4">
      {tracks.map(l1 => {
        const allTopics = l1.categories.flatMap(c => c.topics);
        const hasTopics = allTopics.length > 0;
        const doneCount = allTopics.filter(t => progress[t.id] === 'done').length;
        return (
          <div key={l1.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden group/l1">
            {/* Track header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-[#F0EDE8]">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l1.color }} />
              {editingL1 === l1.id ? (
                <input autoFocus value={editL1Text} onChange={e => setEditL1Text(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveL1Label(l1.id, !!l1.isCustom); if (e.key === 'Escape') setEditingL1(null); }}
                  onBlur={() => saveL1Label(l1.id, !!l1.isCustom)} disabled={saving}
                  className="flex-1 font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] bg-transparent border-b border-[#9B9590] outline-none" />
              ) : (
                <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] flex-1">{l1.label}</h2>
              )}
              {hasTopics && editingL1 !== l1.id && <span className="text-[11px] text-[#9B9590]">{doneCount}/{allTopics.length} done</span>}
              <button onClick={() => { setEditingL1(l1.id); setEditL1Text(l1.label); }}
                className="opacity-0 group-hover/l1:opacity-50 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-[#1C1C1A] transition-opacity" title="Rename">✎</button>
              <button onClick={() => removeL1(l1.id, !!l1.isCustom)}
                className="opacity-0 group-hover/l1:opacity-50 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-red-500 transition-opacity" title="Remove">✕</button>
            </div>

            {!hasTopics ? (
              <div className="px-5 py-6 text-center space-y-1">
                <p className="text-[13px] font-medium text-[#4A4540]">No topics yet</p>
                <p className="text-[11px] text-[#9B9590]">Add a topic below to get started</p>
              </div>
            ) : (
              <div>
                {l1.categories.map((cat, ci) => (
                  <div key={cat.name}>
                    <div className={`px-5 py-2.5 bg-[#F5F2EE] flex items-center justify-between ${ci > 0 ? 'border-t border-[#EEE9E2]' : ''}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B6560]">{cat.name}</p>
                    </div>
                    <div className="divide-y divide-[#F5F2EE]">
                      {cat.topics.map(t => {
                        const status = (progress[t.id] as string) ?? 'not_started';
                        return (
                          <div key={t.id} className="group/row flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_DOT[status] ?? STATUS_DOT.not_started }} />
                            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono" style={{ background: l1.accent, color: l1.color }}>{t.id}</span>
                            <Link href={`/topic/${t.id}`} className="flex-1 min-w-0 group hover:underline">
                              <p className="text-[13px] font-medium text-[#1C1C1A] truncate">{t.title}</p>
                              <p className="text-[11px] text-[#9B9590] truncate mt-0.5 hidden sm:block">{t.desc}</p>
                            </Link>
                            <span className="text-[11px] text-[#9B9590] shrink-0">{t.hours}h</span>
                            <button onClick={() => removeTopic(t.id, !!t.isCustom, l1.id)}
                              className="opacity-0 group-hover/row:opacity-50 hover:!opacity-100 text-[11px] text-[#9B9590] hover:text-red-500 transition-opacity shrink-0" title="Remove topic">✕</button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add topic to this category */}
                    {addingTopic?.l1Id === l1.id && addingTopic?.cat === cat.name ? (
                      <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EEE9E2] flex items-center gap-2">
                        <input autoFocus value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addTopic()}
                          placeholder="Topic title…"
                          className="flex-1 text-[12px] text-[#1C1C1A] bg-white border border-[#D8D3CC] rounded-md px-2 py-1 focus:outline-none focus:border-[#9B9590]" />
                        <input type="number" min={1} max={20} value={newTopicHours} onChange={e => setNewTopicHours(Number(e.target.value))}
                          className="w-14 text-[12px] text-center bg-white border border-[#D8D3CC] rounded-md px-1 py-1 focus:outline-none focus:border-[#9B9590]" />
                        <span className="text-[11px] text-[#9B9590]">h</span>
                        <button onClick={addTopic} disabled={!newTopicTitle.trim() || saving}
                          className="text-[11px] font-semibold px-2 py-1 rounded bg-[#1C1C1A] text-white disabled:opacity-40">Add</button>
                        <button onClick={() => { setAddingTopic(null); setNewTopicTitle(''); }}
                          className="text-[11px] text-[#9B9590]">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setAddingTopic({ l1Id: l1.id, cat: cat.name })}
                        className="w-full text-[11px] text-[#9B9590] hover:text-[#4A4540] py-2 border-t border-[#F5F2EE] hover:bg-[#FAF8F5] transition-colors text-left px-5">
                        + Add topic to {cat.name}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add to new category */}
            {addingTopic?.l1Id === l1.id && !l1.categories.find(c => c.name === addingTopic.cat) ? (
              <div className="px-5 py-3 bg-[#FAF8F5] border-t border-[#EEE9E2] flex items-center gap-2">
                <input autoFocus value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTopic()} placeholder="Topic title…"
                  className="flex-1 text-[12px] bg-white border border-[#D8D3CC] rounded-md px-2 py-1 focus:outline-none focus:border-[#9B9590]" />
                <button onClick={addTopic} disabled={!newTopicTitle.trim() || saving}
                  className="text-[11px] font-semibold px-2 py-1 rounded bg-[#1C1C1A] text-white disabled:opacity-40">Add</button>
                <button onClick={() => { setAddingTopic(null); setNewTopicTitle(''); }}
                  className="text-[11px] text-[#9B9590]">Cancel</button>
              </div>
            ) : null}

            {/* Add topic button (when no categories or as general add) */}
            {addingTopic?.l1Id !== l1.id && (
              <button onClick={() => setAddingTopic({ l1Id: l1.id, cat: l1.categories[0]?.name ?? 'Topics' })}
                className="w-full text-[11px] text-[#9B9590] hover:text-[#4A4540] py-2.5 border-t border-[#F0EDE8] hover:bg-[#FAF8F5] transition-colors">
                + Add topic
              </button>
            )}
          </div>
        );
      })}

      {/* Add new L1 track */}
      {addingTrack ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">New track</p>
          <input autoFocus value={newTrackLabel} onChange={e => setNewTrackLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTrack()} placeholder="Track name…"
            className="w-full text-[14px] font-[family-name:var(--font-playfair)] font-bold text-[#1C1C1A] bg-[#FAF8F5] border border-[#D8D3CC] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#9B9590]" />
          <div className="flex flex-wrap gap-1.5">
            {PALETTE.map(([c, a]) => (
              <button key={c} type="button" onClick={() => { setNewTrackColor(c); setNewTrackAccent(a); }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newTrackColor === c ? 'scale-110 border-[#1C1C1A]' : 'border-transparent'}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addTrack} disabled={!newTrackLabel.trim() || saving}
              className="text-[12px] font-semibold px-4 py-1.5 rounded-lg text-white bg-[#1C1C1A] hover:bg-black disabled:opacity-40">Add track</button>
            <button onClick={() => setAddingTrack(false)} className="text-[12px] text-[#9B9590] hover:text-[#4A4540]">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAddingTrack(true)}
          className="w-full text-[13px] text-[#9B9590] hover:text-[#4A4540] border border-dashed border-[#D8D3CC] hover:border-[#9B9590] rounded-xl py-3 transition-colors">
          + Add track
        </button>
      )}
    </div>
  );
}
