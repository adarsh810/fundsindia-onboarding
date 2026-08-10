'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProgressMap } from '@/lib/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLOR = '#6B3FA0';
const ACCENT = '#D7BDE2';

function statusBg(status: string) {
  if (status === 'done')        return COLOR;
  if (status === 'in_progress') return `${COLOR}99`;
  return ACCENT;
}

function statusText(status: string) {
  return status === 'not_started' ? COLOR : '#FAF8F5';
}

export interface ScheduleTopic {
  id: string;
  title: string;
  desc: string;
  hours: number;
}

export default function OnboardingScheduleView({
  topics,
  progress,
}: {
  topics: ScheduleTopic[];
  progress: ProgressMap;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const doneCount  = topics.filter(t => progress[t.id] === 'done').length;
  const totalHours = topics.reduce((a, t) => a + t.hours, 0);

  return (
    <div className="relative bg-white rounded-xl overflow-hidden"
      style={{ border: `2px solid ${COLOR}` }}>

      {/* Week header — same structure as ScheduleView */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors text-left"
        style={{ background: '#F8F4FF' }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
          <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] shrink-0">
            Week 1
          </h2>
          <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full shrink-0">
            Mon 10 – Sun 16 Aug
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
            style={{ background: ACCENT, color: COLOR }}>
            ▶ This week
          </span>
          <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{topics.length} done</span>
          <span className="text-[11px] font-semibold text-[#4A4540] shrink-0">{totalHours}h</span>
        </div>
        <svg className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Collapsed: topic pills */}
      {!isOpen && (
        <div className="px-5 pb-3.5 flex flex-wrap gap-1.5">
          {topics.map((t, i) => {
            const status = progress[t.id] ?? 'not_started';
            return (
              <Link key={t.id} href={`/topic/${t.id}`}
                className="text-[10px] px-2 py-0.5 rounded-full border hover:brightness-95 transition-all"
                style={{ borderColor: COLOR, color: statusText(status), background: statusBg(status) }}
              >
                {t.id}{status === 'done' ? ' ✓' : status === 'in_progress' ? ' ~' : ''}
              </Link>
            );
          })}
        </div>
      )}

      {/* Expanded: Gantt + topic list */}
      {isOpen && (
        <div className="border-t border-[#EEE9E2] px-5 pb-5 pt-4 space-y-5">

          {/* Hours summary bar */}
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
              <p className="text-[15px] font-semibold text-[#4A4540]">{topics.length - doneCount}</p>
              <p className="text-[10px] text-[#9B9590]">remaining</p>
            </div>
          </div>

          {/* Day columns (Gantt) */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-2.5">
              📅 Mon – Sun · 1 topic/day
            </p>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {DAYS.map((day, i) => {
                const t = topics[i];
                if (!t) return (
                  <div key={day} className="flex flex-col items-stretch gap-1">
                    <p className="text-[10px] font-semibold text-center text-[#9B9590]">{day}</p>
                    <div className="rounded-lg" style={{ height: 56, background: '#F0EDE8' }} />
                    <p className="text-[9px] text-center text-[#C8C2BA]">—</p>
                  </div>
                );
                const status = progress[t.id] ?? 'not_started';
                const label = t.id.split('-')[1] ?? t.id;
                return (
                  <div key={day} className="flex flex-col items-stretch gap-1">
                    <p className="text-[10px] font-semibold text-center text-[#9B9590]">{day}</p>
                    <Link href={`/topic/${t.id}`}
                      className="rounded-lg flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
                      style={{ height: 56, background: statusBg(status) }}
                      title={`${t.title} · ${t.hours}h`}
                    >
                      <span className="text-[9px] font-bold leading-none text-center px-0.5"
                        style={{ color: statusText(status) }}>
                        {label}
                      </span>
                    </Link>
                    <p className="text-[9px] text-center text-[#C8C2BA]">{t.hours}h</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic list rows */}
          <div className="space-y-1">
            {topics.map((t, i) => {
              const status = progress[t.id] ?? 'not_started';
              return (
                <Link key={t.id} href={`/topic/${t.id}`} className="flex items-center gap-2 text-[11px] group">
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
