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

export default function PlanView({ initialProgress, initialTrack }: { initialProgress: ProgressMap; initialTrack?: string }) {
  const [progress, setProgress] = useState<ProgressMap>(initialProgress);
  const validTrack = TOPICS.find(l => l.id === initialTrack)?.id ?? TOPICS[0].id;
  const [activeTrack, setActiveTrack] = useState<string>(validTrack);

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

  const track = TOPICS.find(l => l.id === activeTrack)!;
  const allTopics = track.categories.flatMap(c => c.topics);
  const doneCount = allTopics.filter(t => progress[t.id] === 'done').length;
  const inProgCount = allTopics.filter(t => progress[t.id] === 'in_progress').length;
  const pct = Math.round((doneCount / allTopics.length) * 100);

  return (
    <div>
      {/* Track tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TOPICS.map(l1 => {
          const all = l1.categories.flatMap(c => c.topics);
          const done = all.filter(t => progress[t.id] === 'done').length;
          const isActive = activeTrack === l1.id;
          return (
            <button
              key={l1.id}
              onClick={() => setActiveTrack(l1.id)}
              className="text-[13px] px-4 py-2 rounded-full border font-medium transition-all hover:shadow-sm active:scale-[0.97]"
              style={{
                background: isActive ? l1.color : l1.accent,
                color: isActive ? '#FAF8F5' : l1.color,
                borderColor: isActive ? l1.color : 'transparent',
                boxShadow: isActive ? `0 2px 8px ${l1.color}40` : undefined,
              }}
            >
              {l1.label} · {done}/{all.length}
            </button>
          );
        })}
      </div>

      {/* Track summary bar */}
      <div className="bg-white border border-[#E8E4DE] rounded-xl px-5 py-4 mb-4 flex items-center gap-4">
        <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: track.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-[family-name:var(--font-playfair)] text-[15px] font-bold text-[#1C1C1A]">{track.label}</span>
            <span className="text-[11px] text-[#9B9590]">{track.hours}h · {allTopics.length} topics</span>
            {inProgCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#FEF3D0', color: '#7A5010' }}>
                {inProgCount} active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex-1 h-2 bg-[#EEE9E2] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: track.color }} />
            </div>
            <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{allTopics.length} done</span>
          </div>
        </div>
      </div>

      {/* Topics — flat list grouped by category */}
      <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
        {track.categories.map((cat, ci) => (
          <div key={cat.name}>
            <div className={`px-5 py-3 bg-[#F5F2EE] flex items-center gap-2 ${ci > 0 ? 'border-t border-[#EEE9E2]' : ''}`}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B6560]">{cat.name}</p>
              <span className="text-[10px] text-[#C8C2BA]">
                {cat.topics.filter(t => progress[t.id] === 'done').length}/{cat.topics.length}
              </span>
            </div>
            <div className="divide-y divide-[#F5F2EE]">
              {cat.topics.map(t => {
                const status: Status = (progress[t.id] as Status) ?? 'not_started';
                const s = STATUS_STYLE[status];
                return (
                  <Link
                    key={t.id}
                    href={`/topic/${t.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors group"
                  >
                    <button
                      onClick={e => cycleStatus(t.id, e)}
                      className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{ borderColor: s.dot, background: status === 'not_started' ? 'transparent' : s.bg }}
                      title={`${s.label} — click to advance`}
                    >
                      {status === 'done' && (
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {status === 'in_progress' && (
                        <div className="w-2 h-2 rounded-full" style={{ background: s.dot }} />
                      )}
                    </button>

                    <span
                      className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono"
                      style={{ background: track.accent, color: track.color }}
                    >
                      {t.id}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium group-hover:text-[#000] transition-colors truncate ${status === 'done' ? 'text-[#9B9590] line-through' : 'text-[#1C1C1A]'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-[#9B9590] truncate mt-0.5 hidden sm:block">{t.desc}</p>
                    </div>

                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-[11px] text-[#9B9590]">{t.week}</p>
                      <p className="text-[11px] font-medium text-[#4A4540]">{t.hours}h</p>
                    </div>

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
    </div>
  );
}
