'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WEEKS, findTopicById, findTrackForTopic } from '@/lib/data';
import type { ProgressMap } from '@/lib/types';

// Week 1 starts June 8, 2026
const WEEK1_START = new Date('2026-06-08T00:00:00+05:30');
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeek(): number {
  const ms = Date.now() - WEEK1_START.getTime();
  if (ms < 0) return 1;
  return Math.min(Math.floor(ms / MS_PER_WEEK) + 1, 8);
}

function parseTopicIds(text: string): string[] {
  return (text.match(/\((\d+\.\d+)\)/g) ?? []).map(m => m.slice(1, -1));
}

function weeklyHours(topicId: string): number {
  const topic = findTopicById(topicId);
  if (!topic) return 0;
  if (/W\d+[–\-]\d+/.test(topic.week)) {
    const parts = topic.week.replace('–', '-').split('-');
    const count = parseInt(parts[1].replace('W', '')) - parseInt(parts[0].replace('W', '')) + 1;
    return Math.ceil(topic.hours / count);
  }
  return topic.hours;
}

type DaySlot = { topicId: string; hours: number }[];

function distributeTopics(ids: string[], hoursPerDay: number, numDays: number): DaySlot[] {
  const days: DaySlot[] = Array.from({ length: numDays }, () => []);
  const budgets = Array(numDays).fill(hoursPerDay);
  let dayIdx = 0;
  for (const id of ids) {
    let rem = weeklyHours(id);
    while (rem > 0 && dayIdx < numDays) {
      const fit = Math.min(rem, budgets[dayIdx]);
      if (fit > 0) {
        days[dayIdx].push({ topicId: id, hours: fit });
        budgets[dayIdx] -= fit;
        rem -= fit;
      }
      if (budgets[dayIdx] <= 0) dayIdx++;
    }
  }
  return days;
}

// Single day column
function DayColumn({
  label, hoursPerDay, slots, progress,
}: {
  label: string;
  hoursPerDay: number;
  slots: DaySlot;
  progress: ProgressMap;
}) {
  const COL_HEIGHT = 56; // px — same for all days, proportion shows share of day

  return (
    <div className="flex flex-col items-stretch gap-1">
      <p className="text-[10px] font-semibold text-center text-[#9B9590] mb-0.5">{label}</p>
      <div
        className="rounded-lg overflow-hidden flex flex-col"
        style={{ height: COL_HEIGHT, background: '#F0EDE8' }}
      >
        {slots.length === 0 ? (
          <div className="flex-1" />
        ) : (
          slots.map(({ topicId, hours }) => {
            const topic = findTopicById(topicId);
            const track = findTrackForTopic(topicId);
            if (!topic || !track) return null;
            const isDone = progress[topicId] === 'done';
            const pct = (hours / hoursPerDay) * 100;
            return (
              <Link
                key={topicId}
                href={`/topic/${topicId}`}
                className="flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
                style={{
                  height: `${pct}%`,
                  background: isDone ? track.color : track.accent,
                  borderBottom: '1px solid #FAF8F5',
                }}
                title={`${topic.title} · ${hours}h`}
              >
                {pct >= 40 && (
                  <span
                    className="text-[9px] font-bold truncate px-0.5 leading-none"
                    style={{ color: isDone ? '#FAF8F5' : track.color }}
                  >
                    {topic.id}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
      <p className="text-[9px] text-center text-[#C8C2BA]">{hoursPerDay}h</p>
    </div>
  );
}

// Day grid section (Mon–Fri or Sat–Sun)
function DaySection({
  emoji, dayLabels, hoursPerDay, topicIds, progress,
}: {
  emoji: string;
  dayLabels: string[];
  hoursPerDay: number;
  topicIds: string[];
  progress: ProgressMap;
}) {
  if (topicIds.length === 0) return null;
  const days = distributeTopics(topicIds, hoursPerDay, dayLabels.length);

  const entries = topicIds
    .map(id => ({ id, topic: findTopicById(id), track: findTrackForTopic(id), hours: weeklyHours(id) }))
    .filter(e => e.topic && e.track);

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-2.5">
        {emoji} {dayLabels.join(' – ')} · {hoursPerDay}h/day
      </p>
      {/* Day columns */}
      <div
        className="grid gap-1.5 mb-3"
        style={{ gridTemplateColumns: `repeat(${dayLabels.length}, 1fr)` }}
      >
        {dayLabels.map((label, i) => (
          <DayColumn
            key={label}
            label={label}
            hoursPerDay={hoursPerDay}
            slots={days[i]}
            progress={progress}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="space-y-1">
        {entries.map(({ id, topic, track, hours }) => {
          const isDone = progress[id] === 'done';
          return (
            <Link
              key={id}
              href={`/topic/${id}`}
              className="flex items-center gap-2 text-[11px] group"
            >
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{
                  background: isDone ? track!.color : track!.accent,
                  border: `1.5px solid ${track!.color}`,
                }}
              />
              <span className="font-mono text-[10px] text-[#9B9590] w-7 shrink-0">{id}</span>
              <span className="text-[#4A4540] group-hover:text-[#1C1C1A] transition-colors truncate">
                {topic!.title}
              </span>
              <span className="text-[#9B9590] ml-auto shrink-0">{hours}h</span>
              {isDone && <span style={{ color: track!.color }} className="text-[10px] shrink-0">✓</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function ScheduleView({ progress }: { progress: ProgressMap }) {
  const currentWeek = getCurrentWeek();
  const isFuture = Date.now() < WEEK1_START.getTime();
  const [openWeek, setOpenWeek] = useState<number | null>(currentWeek);

  return (
    <div className="space-y-3">
      {WEEKS.map((w, i) => {
        const weekNum = i + 1;
        const isCurrent = weekNum === currentWeek;
        const isOpen = openWeek === weekNum;
        const weekdayIds = parseTopicIds(w.weekday);
        const weekendIds = parseTopicIds(w.weekend);
        const allIds = [...weekdayIds, ...weekendIds];
        const doneCount = allIds.filter(id => progress[id] === 'done').length;

        return (
          <div
            key={w.week}
            className="bg-white rounded-xl overflow-hidden transition-all"
            style={{
              border: isCurrent ? '2px solid #2D6A4F' : '1px solid #E8E4DE',
            }}
          >
            {/* Header */}
            <button
              onClick={() => setOpenWeek(isOpen ? null : weekNum)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] shrink-0">
                  Week {weekNum}
                </h2>
                <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full shrink-0">
                  {w.week}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: '#B7E4C7', color: '#2D6A4F' }}>
                    {isFuture ? '▶ Starting soon' : '▶ This week'}
                  </span>
                )}
                <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{allIds.length} done</span>
              </div>
              <svg
                className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsed: topic pills */}
            {!isOpen && (
              <div className="px-5 pb-3.5 flex flex-wrap gap-1.5">
                {allIds.map(id => {
                  const topic = findTopicById(id);
                  const track = findTrackForTopic(id);
                  if (!topic || !track) return null;
                  const isDone = progress[id] === 'done';
                  return (
                    <Link
                      key={id}
                      href={`/topic/${id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] px-2 py-0.5 rounded-full border hover:brightness-95 transition-all"
                      style={{
                        borderColor: track.color,
                        color: isDone ? '#FAF8F5' : track.color,
                        background: isDone ? track.color : track.accent,
                      }}
                    >
                      {topic.id}{isDone ? ' ✓' : ''}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Expanded: day Gantt */}
            {isOpen && (
              <div className="border-t border-[#EEE9E2] px-5 pb-5 pt-4 space-y-5">
                <DaySection
                  emoji="⏱"
                  dayLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                  hoursPerDay={2}
                  topicIds={weekdayIds}
                  progress={progress}
                />
                <DaySection
                  emoji="🌿"
                  dayLabels={['Sat', 'Sun']}
                  hoursPerDay={4}
                  topicIds={weekendIds}
                  progress={progress}
                />
                <div className="border-t border-[#EEE9E2] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-1.5">
                    📄 Artifacts due
                  </p>
                  <p className="text-[11px] text-[#6B6560] leading-relaxed">{w.artifacts}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
