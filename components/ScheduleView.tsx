'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WEEKS, ALL_TOPICS, findTopicById, findTrackForTopic } from '@/lib/data';
import type { ProgressMap } from '@/lib/types';

// ─── Date helpers ────────────────────────────────────────────────────────────

const WEEK1_START = new Date('2026-06-08T00:00:00+05:30');
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeek(): number {
  const ms = Date.now() - WEEK1_START.getTime();
  if (ms < 0) return 1;
  return Math.min(Math.floor(ms / MS_PER_WEEK) + 1, 10);
}

// ─── Topic-week helpers ───────────────────────────────────────────────────────

function parseTopicIds(text: string): string[] {
  return (text.match(/\((\d+\.\d+)\)/g) ?? []).map(m => m.slice(1, -1));
}

/** All week numbers a topic spans, derived from topic.week field (source of truth). */
function topicWeekNums(topicId: string): number[] {
  const topic = findTopicById(topicId);
  if (!topic) return [];
  const w = topic.week;
  if (/^W\d+$/.test(w)) return [parseInt(w.slice(1))];
  const range = w.match(/^W(\d+)[–\-](\d+)$/);
  if (range) {
    const out: number[] = [];
    for (let i = parseInt(range[1]); i <= parseInt(range[2]); i++) out.push(i);
    return out;
  }
  // Comma-separated e.g. "W1,3,7"
  if (/^W\d+(,\d+)+$/.test(w)) return w.slice(1).split(',').map(Number);
  return [];
}

/** Hours to spend on a topic in a single week (divides evenly across span). */
function weeklyHours(topicId: string): number {
  const topic = findTopicById(topicId);
  if (!topic) return 0;
  const span = topicWeekNums(topicId).length;
  return span > 1 ? Math.ceil(topic.hours / span) : topic.hours;
}

// Build weekday/weekend assignment from WEEKS text (first occurrence wins).
// Topics missing from a week's WEEKS text inherit their first-appearance assignment.
const ASSIGNMENT: Record<string, 'weekday' | 'weekend'> = (() => {
  const map: Record<string, 'weekday' | 'weekend'> = {};
  WEEKS.forEach(w => {
    parseTopicIds(w.weekday).forEach(id => { if (!map[id]) map[id] = 'weekday'; });
    parseTopicIds(w.weekend).forEach(id => { if (!map[id]) map[id] = 'weekend'; });
  });
  return map;
})();

/** Return all topics for a week, including multi-week topics missing from WEEKS text. */
function getTopicsForWeek(weekNum: number): { weekdayIds: string[]; weekendIds: string[] } {
  const w = WEEKS[weekNum - 1];
  const weekdayIds = parseTopicIds(w.weekday);
  const weekendIds = parseTopicIds(w.weekend);
  const listed = new Set([...weekdayIds, ...weekendIds]);

  for (const topic of ALL_TOPICS) {
    if (listed.has(topic.id)) continue;
    if (!topicWeekNums(topic.id).includes(weekNum)) continue;
    const slot = ASSIGNMENT[topic.id] ?? 'weekday';
    (slot === 'weekday' ? weekdayIds : weekendIds).push(topic.id);
  }
  return { weekdayIds, weekendIds };
}

// ─── Day distribution ─────────────────────────────────────────────────────────

type DaySlot = { topicId: string; hours: number }[];

function distributeTopics(ids: string[], hoursPerDay: number, numDays: number): DaySlot[] {
  const days: DaySlot[] = Array.from({ length: numDays }, () => []);
  const budgets = Array(numDays).fill(hoursPerDay);
  let d = 0;
  for (const id of ids) {
    let rem = weeklyHours(id);
    while (rem > 0 && d < numDays) {
      const fit = Math.min(rem, budgets[d]);
      if (fit > 0) { days[d].push({ topicId: id, hours: fit }); budgets[d] -= fit; rem -= fit; }
      if (budgets[d] <= 0) d++;
    }
  }
  return days;
}

// ─── Status colour helpers ────────────────────────────────────────────────────

type Track = NonNullable<ReturnType<typeof findTrackForTopic>>;

function statusBg(status: string, track: Track): string {
  if (status === 'done')        return track.color;
  if (status === 'in_progress') return `${track.color}99`; // ~60% opacity — mid-tone
  return track.accent;
}

function statusTextColor(status: string, track: Track): string {
  return status === 'not_started' ? track.color : '#FAF8F5';
}

// ─── Day column ───────────────────────────────────────────────────────────────

function DayColumn({ label, hoursPerDay, slots, progress }: {
  label: string; hoursPerDay: number; slots: DaySlot; progress: ProgressMap;
}) {
  return (
    <div className="flex flex-col items-stretch gap-1">
      <p className="text-[10px] font-semibold text-center text-[#9B9590]">{label}</p>
      <div className="rounded-lg overflow-hidden flex flex-col" style={{ height: 56, background: '#F0EDE8' }}>
        {slots.length === 0 ? <div className="flex-1" /> : slots.map(({ topicId, hours }) => {
          const topic = findTopicById(topicId);
          const track = findTrackForTopic(topicId);
          if (!topic || !track) return null;
          const status = progress[topicId] ?? 'not_started';
          const pct = (hours / hoursPerDay) * 100;
          return (
            <Link key={topicId} href={`/topic/${topicId}`}
              className="flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
              style={{ height: `${pct}%`, background: statusBg(status, track), borderBottom: '1px solid #FAF8F5' }}
              title={`${topic.title} · ${hours}h`}
            >
              {pct >= 38 && (
                <span className="text-[9px] font-bold px-0.5 leading-none" style={{ color: statusTextColor(status, track) }}>
                  {topic.id}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <p className="text-[9px] text-center text-[#C8C2BA]">{hoursPerDay}h</p>
    </div>
  );
}

// ─── Day section (Mon–Fri or Sat–Sun) ────────────────────────────────────────

function DaySection({ emoji, dayLabels, hoursPerDay, topicIds, progress }: {
  emoji: string; dayLabels: string[]; hoursPerDay: number; topicIds: string[]; progress: ProgressMap;
}) {
  if (topicIds.length === 0) return null;
  const days = distributeTopics(topicIds, hoursPerDay, dayLabels.length);
  const entries = topicIds
    .map(id => ({ id, topic: findTopicById(id), track: findTrackForTopic(id), wh: weeklyHours(id), total: findTopicById(id)?.hours ?? 0 }))
    .filter(e => e.topic && e.track);

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-2.5">
        {emoji} {dayLabels.join(' – ')} · {hoursPerDay}h/day
      </p>
      <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: `repeat(${dayLabels.length}, 1fr)` }}>
        {dayLabels.map((label, i) => (
          <DayColumn key={label} label={label} hoursPerDay={hoursPerDay} slots={days[i]} progress={progress} />
        ))}
      </div>
      <div className="space-y-1">
        {entries.map(({ id, topic, track, wh, total }) => {
          const status = progress[id] ?? 'not_started';
          const isMultiWeek = topicWeekNums(id).length > 1;
          return (
            <Link key={id} href={`/topic/${id}`} className="flex items-center gap-2 text-[11px] group">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: statusBg(status, track!), border: `1.5px solid ${track!.color}` }} />
              <span className="font-mono text-[10px] text-[#9B9590] w-7 shrink-0">{id}</span>
              <span className="text-[#4A4540] group-hover:text-[#1C1C1A] transition-colors truncate">{topic!.title}</span>
              <span className="text-[#9B9590] ml-auto shrink-0">
                {isMultiWeek ? `${wh}h` : `${total}h`}
                {isMultiWeek && <span className="text-[#C8C2BA]"> / {total}h total</span>}
              </span>
              {status === 'done' && <span style={{ color: track!.color }} className="text-[10px] shrink-0">✓</span>}
              {status === 'in_progress' && <span style={{ color: track!.color }} className="text-[10px] shrink-0 opacity-60">~</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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
        const { weekdayIds, weekendIds } = getTopicsForWeek(weekNum);
        const allIds = [...weekdayIds, ...weekendIds];
        const doneCount = allIds.filter(id => progress[id] === 'done').length;
        const weekdayHours = weekdayIds.reduce((s, id) => s + weeklyHours(id), 0);
        const weekendHours = weekendIds.reduce((s, id) => s + weeklyHours(id), 0);
        const totalHours = weekdayHours + weekendHours;

        return (
          <div key={w.week} className="bg-white rounded-xl overflow-hidden transition-all"
            style={{ border: isCurrent ? '2px solid #2D6A4F' : '1px solid #E8E4DE' }}>

            <button onClick={() => setOpenWeek(isOpen ? null : weekNum)}
              className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors text-left">
              <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] shrink-0">
                  Week {weekNum}
                </h2>
                <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full shrink-0">{w.week}</span>
                {isCurrent && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: '#B7E4C7', color: '#2D6A4F' }}>
                    {isFuture ? '▶ Starting soon' : '▶ This week'}
                  </span>
                )}
                <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{allIds.length} done</span>
                <span className="text-[11px] font-semibold text-[#4A4540] shrink-0">{totalHours}h</span>
              </div>
              <svg className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!isOpen && (
              <div className="px-5 pb-3.5 flex flex-wrap gap-1.5">
                {allIds.map(id => {
                  const topic = findTopicById(id);
                  const track = findTrackForTopic(id);
                  if (!topic || !track) return null;
                  const status = progress[id] ?? 'not_started';
                  return (
                    <Link key={id} href={`/topic/${id}`} onClick={e => e.stopPropagation()}
                      className="text-[10px] px-2 py-0.5 rounded-full border hover:brightness-95 transition-all"
                      style={{ borderColor: track.color, color: statusTextColor(status, track), background: statusBg(status, track) }}>
                      {topic.id}{status === 'done' ? ' ✓' : status === 'in_progress' ? ' ~' : ''}
                    </Link>
                  );
                })}
              </div>
            )}

            {isOpen && (
              <div className="border-t border-[#EEE9E2] px-5 pb-5 pt-4 space-y-5">
                {/* Week hours summary */}
                <div className="flex items-center gap-3 bg-[#FAF8F5] rounded-xl px-4 py-3">
                  <div className="flex-1 text-center">
                    <p className="text-[18px] font-bold text-[#1C1C1A]">{totalHours}h</p>
                    <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em]">this week</p>
                  </div>
                  <div className="w-px h-8 bg-[#E8E4DE]" />
                  <div className="flex-1 text-center">
                    <p className="text-[15px] font-semibold text-[#4A4540]">{weekdayHours}h</p>
                    <p className="text-[10px] text-[#9B9590]">Mon–Fri</p>
                  </div>
                  <div className="w-px h-8 bg-[#E8E4DE]" />
                  <div className="flex-1 text-center">
                    <p className="text-[15px] font-semibold text-[#4A4540]">{weekendHours}h</p>
                    <p className="text-[10px] text-[#9B9590]">Sat–Sun</p>
                  </div>
                </div>
                <DaySection emoji="⏱" dayLabels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                  hoursPerDay={2} topicIds={weekdayIds} progress={progress} />
                <DaySection emoji="🌿" dayLabels={['Sat', 'Sun']}
                  hoursPerDay={3} topicIds={weekendIds} progress={progress} />
                <div className="border-t border-[#EEE9E2] pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-1.5">📄 Artifacts due</p>
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
