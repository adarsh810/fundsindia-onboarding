'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TOPICS } from '@/lib/data';
import type { ProgressMap, Status } from '@/lib/types';

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

export default function PlanView({ initialProgress }: { initialProgress: ProgressMap }) {
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  const [openTracks, setOpenTracks] = useState<Set<string>>(new Set(TOPICS.map(l => l.id)));
  const [activeTrack, setActiveTrack] = useState<string>(TOPICS[0].id);

  function toggleTrack(id: string) {
    setOpenTracks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  const visible = TOPICS.filter(l => l.id === activeTrack);

  return (
    <div>
      {/* Track filter pills */}
      <div className="flex gap-2 flex-wrap mb-7">
        {TOPICS.map(l1 => {
          const all = l1.categories.flatMap(c => c.topics);
          const done = all.filter(t => progress[t.id] === 'done').length;
          const isActive = activeTrack === l1.id;
          return (
            <button
              key={l1.id}
              onClick={() => setActiveTrack(l1.id)}
              className="text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all"
              style={{
                background: isActive ? l1.color : l1.accent,
                color: isActive ? '#FAF8F5' : l1.color,
                borderColor: isActive ? l1.color : 'transparent',
              }}
            >
              {l1.label} · {done}/{all.length}
            </button>
          );
        })}
      </div>

      {/* L1 accordion grid — 2×2 on desktop */}
      <div className={`grid gap-2.5 items-start ${visible.length >= 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {visible.map(l1 => {
          const allTopics = l1.categories.flatMap(c => c.topics);
          const doneCount = allTopics.filter(t => progress[t.id] === 'done').length;
          const inProgCount = allTopics.filter(t => progress[t.id] === 'in_progress').length;
          const isOpen = openTracks.has(l1.id);
          const pct = Math.round((doneCount / allTopics.length) * 100);

          return (
            <div key={l1.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">

              {/* L1 header */}
              <button
                onClick={() => toggleTrack(l1.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: l1.color }} />
                  <span className="font-[family-name:var(--font-playfair)] text-[16px] font-bold text-[#1C1C1A] shrink-0">
                    {l1.label}
                  </span>
                  <span className="text-[11px] text-[#9B9590] shrink-0">{l1.hours}h</span>
                  {inProgCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: '#FEF3D0', color: '#7A5010' }}>
                      {inProgCount} active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-[11px] text-[#9B9590] hidden sm:block">
                    {doneCount}/{allTopics.length}
                  </span>
                  <div className="w-20 h-1 rounded-full bg-[#EEE9E2] overflow-hidden hidden sm:block">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: l1.color }}
                    />
                  </div>
                  <svg
                    className={`w-4 h-4 text-[#9B9590] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Topics */}
              {isOpen && (
                <div className="border-t border-[#EEE9E2]">
                  {l1.categories.map(cat => (
                    <div key={cat.name}>
                      <div className="px-5 py-2 bg-[#FAF8F5] border-b border-[#EEE9E2]">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">
                          {cat.name}
                        </p>
                      </div>
                      <div className="divide-y divide-[#F5F2EE]">
                        {cat.topics.map(t => {
                          const status: Status = (progress[t.id] as Status) ?? 'not_started';
                          const s = STATUS_STYLE[status];
                          return (
                            <Link
                              key={t.id}
                              href={`/topic/${t.id}`}
                              className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#FAF8F5] transition-colors group"
                            >
                              {/* Clickable status badge */}
                              <button
                                onClick={e => cycleStatus(t.id, e)}
                                className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium transition-all hover:brightness-95 active:scale-95"
                                style={{ background: s.bg, color: s.text }}
                                title={`${s.label} — click to advance`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                                <span className="hidden sm:inline">{s.label}</span>
                              </button>

                              {/* Topic ID */}
                              <span
                                className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md font-mono"
                                style={{ background: l1.accent, color: l1.color }}
                              >
                                {t.id}
                              </span>

                              {/* Title */}
                              <span className="text-[13px] font-medium text-[#1C1C1A] group-hover:text-[#000] flex-1 min-w-0 truncate">
                                {t.title}
                              </span>

                              {/* Week · hours */}
                              <span className="text-[11px] text-[#9B9590] shrink-0 hidden sm:block">
                                {t.week} · {t.hours}h
                              </span>

                              {/* Arrow */}
                              <svg
                                className="w-3.5 h-3.5 text-[#D5CFC8] group-hover:text-[#9B9590] transition-colors shrink-0"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
