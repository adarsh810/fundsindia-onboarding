'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProgressMap } from '@/lib/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLOR = '#6B3FA0';
const ACCENT = '#D7BDE2';

function statusBg(s: string) {
  if (s === 'done')        return COLOR;
  if (s === 'in_progress') return `${COLOR}99`;
  return ACCENT;
}
function statusText(s: string) { return s === 'not_started' ? COLOR : '#FAF8F5'; }

export interface ScheduleTopic { id: string; title: string; desc: string; hours: number }

// Compute current Monday (ISO week start)
function thisMonday(): Date {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function weekRangeLabel(weekIndex: number, monday: Date): string {
  const start = new Date(monday);
  start.setDate(monday.getDate() + weekIndex * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function WeekBlock({ weekNum, weekTopics, globalOffset, progress, monday, isCurrent }: {
  weekNum: number;
  weekTopics: ScheduleTopic[];
  globalOffset: number;
  progress: ProgressMap;
  monday: Date;
  isCurrent: boolean;
}) {
  const [isOpen, setIsOpen] = useState(isCurrent);

  const doneCount  = weekTopics.filter(t => progress[t.id] === 'done').length;
  const totalHours = weekTopics.reduce((a, t) => a + t.hours, 0);
  const colCount   = Math.min(weekTopics.length, 7);

  return (
    <div className="relative bg-white rounded-xl overflow-hidden"
      style={{ border: isCurrent ? `2px solid ${COLOR}` : '1px solid #E8E4DE' }}>

      {/* Header */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
        style={{ background: isCurrent ? '#F8F4FF' : undefined }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] shrink-0">
            Week {weekNum}
          </h2>
          <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full shrink-0">
            {weekRangeLabel(weekNum - 1, monday)}
          </span>
          {isCurrent && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
              style={{ background: ACCENT, color: COLOR }}>
              ▶ This week
            </span>
          )}
          <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{weekTopics.length} done</span>
          <span className="text-[11px] font-semibold text-[#4A4540] shrink-0">{totalHours}h</span>
        </div>
        <svg className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsed: pills */}
      {!isOpen && (
        <div className="px-5 pb-3.5 flex flex-wrap gap-1.5">
          {weekTopics.map((t, i) => {
            const status = progress[t.id] ?? 'not_started';
            return (
              <Link key={t.id} href={`/onboarding/topic/${t.id}`}
                className="text-[10px] px-2 py-0.5 rounded-full border hover:brightness-95 transition-all"
                style={{ borderColor: COLOR, color: statusText(status), background: statusBg(status) }}
              >
                {globalOffset + i + 1}{status === 'done' ? ' ✓' : status === 'in_progress' ? ' ~' : ''}
              </Link>
            );
          })}
        </div>
      )}

      {/* Expanded */}
      {isOpen && (
        <div className="border-t border-[#EEE9E2] px-5 pb-5 pt-4 space-y-5">

          {/* Hours summary */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] rounded-xl px-4 py-3">
            <div className="flex-1 text-center">
              <p className="text-[18px] font-bold text-[#1C1C1A]">{totalHours}h</p>
              <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em]">this week</p>
            </div>
            <div className="w-px h-8 bg-[#E8E4DE]" />
            <div className="flex-1 text-center">
              <p className="text-[15px] font-semibold" style={{ color: COLOR }}>{doneCount}</p>
              <p className="text-[10px] text-[#9B9590]">done</p>
            </div>
            <div className="w-px h-8 bg-[#E8E4DE]" />
            <div className="flex-1 text-center">
              <p className="text-[15px] font-semibold text-[#4A4540]">{weekTopics.length - doneCount}</p>
              <p className="text-[10px] text-[#9B9590]">remaining</p>
            </div>
          </div>

          {/* Day columns (Gantt) */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-2.5">
              📅 {DAYS[0]} – {DAYS[weekTopics.length - 1] ?? DAYS[6]} · 1 topic/day
            </p>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
              {DAYS.slice(0, colCount).map((day, i) => {
                const t = weekTopics[i];
                if (!t) return (
                  <div key={day} className="flex flex-col items-stretch gap-1">
                    <p className="text-[10px] font-semibold text-center text-[#9B9590]">{day}</p>
                    <div className="rounded-lg" style={{ height: 56, background: '#F0EDE8' }} />
                  </div>
                );
                const status = progress[t.id] ?? 'not_started';
                return (
                  <div key={day} className="flex flex-col items-stretch gap-1">
                    <p className="text-[10px] font-semibold text-center text-[#9B9590]">{day}</p>
                    <Link href={`/onboarding/topic/${t.id}`}
                      className="rounded-lg flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
                      style={{ height: 56, background: statusBg(status) }}
                      title={`${t.title} · ${t.hours}h`}
                    >
                      <span className="text-[9px] font-bold leading-none px-0.5" style={{ color: statusText(status) }}>
                        {globalOffset + i + 1}
                      </span>
                    </Link>
                    <p className="text-[9px] text-center text-[#C8C2BA]">{t.hours}h</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic list */}
          <div className="space-y-1">
            {weekTopics.map((t, i) => {
              const status = progress[t.id] ?? 'not_started';
              return (
                <Link key={t.id} href={`/onboarding/topic/${t.id}`} className="flex items-center gap-2 text-[11px] group">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ background: statusBg(status), border: `1.5px solid ${COLOR}` }} />
                  <span className="font-mono text-[10px] text-[#9B9590] w-7 shrink-0">{DAYS[i]}</span>
                  <span className="text-[#4A4540] group-hover:text-[#1C1C1A] transition-colors truncate">{t.title}</span>
                  <span className="text-[#9B9590] ml-auto shrink-0">{t.hours}h</span>
                  {status === 'done'        && <span className="text-[10px] shrink-0" style={{ color: COLOR }}>✓</span>}
                  {status === 'in_progress' && <span className="text-[10px] shrink-0 opacity-60" style={{ color: COLOR }}>~</span>}
                </Link>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

export default function OnboardingScheduleView({
  topics,
  progress,
}: {
  topics: ScheduleTopic[];
  progress: ProgressMap;
}) {
  const monday = thisMonday();

  // Split topics into chunks of 7 (one per week)
  const weeks: ScheduleTopic[][] = [];
  for (let i = 0; i < topics.length; i += 7) {
    weeks.push(topics.slice(i, i + 7));
  }
  if (weeks.length === 0) weeks.push([]);

  return (
    <div className="space-y-3">
      {weeks.map((weekTopics, wi) => (
        <WeekBlock
          key={wi}
          weekNum={wi + 1}
          weekTopics={weekTopics}
          globalOffset={wi * 7}
          progress={progress}
          monday={monday}
          isCurrent={wi === 0}
        />
      ))}
    </div>
  );
}
