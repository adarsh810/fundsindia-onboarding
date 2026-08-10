'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { WEEKS, ALL_TOPICS, findTopicById, findTrackForTopic, resolveMeta } from '@/lib/data';
import type { ProgressMap, Topic } from '@/lib/types';
import type { MetaOverrideMap } from '@/lib/supabase';
import {
  type OverrideMap,
  type Position,
  type PillRef,
  type WeekBucket,
  buildWeekBuckets,
  pillHours,
  sumPillHours,
  autoplaceSide,
  getEffectivePositions,
  defaultPositions,
} from '@/lib/schedule';

// ─── Date helpers ────────────────────────────────────────────────────────────

const WEEK1_START = new Date('2026-06-15T00:00:00+05:30');
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeek(): number {
  const ms = Date.now() - WEEK1_START.getTime();
  if (ms < 0) return 1;
  return Math.min(Math.floor(ms / MS_PER_WEEK) + 1, 10);
}

// ─── Status colour helpers ────────────────────────────────────────────────────

type Track = NonNullable<ReturnType<typeof findTrackForTopic>>;

function statusBg(status: string, track: Track): string {
  if (status === 'done')        return track.color;
  if (status === 'in_progress') return `${track.color}99`;
  return track.accent;
}

function statusTextColor(status: string, track: Track): string {
  return status === 'not_started' ? track.color : '#FAF8F5';
}

// ─── Day distribution ─────────────────────────────────────────────────────────

type DaySlot = { topicId: string; hours: number }[];

function distributePills(pills: PillRef[], hoursPerDay: number, numDays: number, overrides: OverrideMap): DaySlot[] {
  const days: DaySlot[] = Array.from({ length: numDays }, () => []);
  const budgets = Array(numDays).fill(hoursPerDay);
  let d = 0;
  for (const p of pills) {
    let rem = pillHours(p.topicId, overrides);
    while (rem > 0 && d < numDays) {
      const fit = Math.min(rem, budgets[d]);
      if (fit > 0) { days[d].push({ topicId: p.topicId, hours: fit }); budgets[d] -= fit; rem -= fit; }
      if (budgets[d] <= 0) d++;
    }
  }
  return days;
}

// ─── Day column ───────────────────────────────────────────────────────────────

function DayColumn({ label, hoursPerDay, slots, progress, metas }: {
  label: string; hoursPerDay: number; slots: DaySlot; progress: ProgressMap; metas: MetaOverrideMap;
}) {
  return (
    <div className="flex flex-col items-stretch gap-1">
      <p className="text-[10px] font-semibold text-center text-[#9B9590]">{label}</p>
      <div className="rounded-lg overflow-hidden flex flex-col" style={{ height: 56, background: '#F0EDE8' }}>
        {slots.length === 0 ? <div className="flex-1" /> : slots.map(({ topicId, hours }, i) => {
          const topic = findTopicById(topicId);
          const track = findTrackForTopic(topicId);
          if (!topic || !track) return null;
          const status = progress[topicId] ?? 'not_started';
          const pct = (hours / hoursPerDay) * 100;
          return (
            <Link key={`${topicId}-${i}`} href={`/topic/${topicId}`}
              className="flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
              style={{ height: `${pct}%`, background: statusBg(status, track), borderBottom: '1px solid #FAF8F5' }}
              title={`${resolveMeta(topic, metas).title} · ${hours}h`}
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

// ─── Day section ──────────────────────────────────────────────────────────────

function DaySection({ emoji, dayLabels, hoursPerDay, pills, progress, overrides, metas }: {
  emoji: string; dayLabels: string[]; hoursPerDay: number; pills: PillRef[]; progress: ProgressMap; overrides: OverrideMap; metas: MetaOverrideMap;
}) {
  if (pills.length === 0) return null;
  const days = distributePills(pills, hoursPerDay, dayLabels.length, overrides);
  const entries = pills.map(p => {
    const topic = findTopicById(p.topicId);
    const track = findTrackForTopic(p.topicId);
    const positions = topic ? getEffectivePositions(topic, overrides) : [];
    return {
      pill: p,
      topic,
      track,
      wh: pillHours(p.topicId, overrides),
      total: topic?.hours ?? 0,
      isMulti: positions.length > 1,
    };
  }).filter(e => e.topic && e.track);

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590] mb-2.5">
        {emoji} {dayLabels.join(' – ')} · {hoursPerDay}h/day
      </p>
      <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: `repeat(${dayLabels.length}, 1fr)` }}>
        {dayLabels.map((label, i) => (
          <DayColumn key={label} label={label} hoursPerDay={hoursPerDay} slots={days[i]} progress={progress} metas={metas} />
        ))}
      </div>
      <div className="space-y-1">
        {entries.map(({ pill, topic, track, wh, total, isMulti }) => {
          const status = progress[pill.topicId] ?? 'not_started';
          return (
            <Link key={`${pill.topicId}-${pill.positionIndex}`} href={`/topic/${pill.topicId}`} className="flex items-center gap-2 text-[11px] group">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ background: statusBg(status, track!), border: `1.5px solid ${track!.color}` }} />
              <span className="font-mono text-[10px] text-[#9B9590] w-7 shrink-0">{pill.topicId}</span>
              <span className="text-[#4A4540] group-hover:text-[#1C1C1A] transition-colors truncate">{resolveMeta(topic!, metas).title}</span>
              <span className="text-[#9B9590] ml-auto shrink-0">
                {isMulti ? `${wh}h` : `${total}h`}
                {isMulti && <span className="text-[#C8C2BA]"> / {total}h total</span>}
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

// ─── Draggable pill (collapsed weeks only) ────────────────────────────────────

const pillDragId = (p: PillRef) => `pill::${p.topicId}::${p.positionIndex}`;
const weekDropId = (n: number) => `week::${n}`;

function parsePillDragId(id: string): PillRef | null {
  const m = id.match(/^pill::(.+)::(\d+)$/);
  if (!m) return null;
  return { topicId: m[1], positionIndex: parseInt(m[2]) };
}

function parseWeekDropId(id: string): number | null {
  const m = id.match(/^week::(\d+)$/);
  return m ? parseInt(m[1]) : null;
}

function DraggablePill({ pill, topic, track, status, disabled }: {
  pill: PillRef; topic: Topic; track: Track; status: string; disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: pillDragId(pill),
    disabled,
  });

  const draggableProps = disabled ? {} : { ...attributes, ...listeners };

  return (
    <Link
      ref={setNodeRef as unknown as React.Ref<HTMLAnchorElement>}
      href={`/topic/${pill.topicId}`}
      onClick={e => {
        if (isDragging) e.preventDefault();
        e.stopPropagation();
      }}
      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all select-none ${disabled ? 'hover:brightness-95 hover:underline' : 'cursor-grab active:cursor-grabbing'} ${isDragging ? 'opacity-30' : ''}`}
      style={{
        borderColor: track.color,
        color: statusTextColor(status, track),
        background: statusBg(status, track),
        touchAction: disabled ? undefined : 'none',
      }}
      title={disabled ? undefined : 'Drag to another week'}
      {...draggableProps}
    >
      {topic.id}{status === 'done' ? ' ✓' : status === 'in_progress' ? ' ~' : ''}
    </Link>
  );
}

function DropWeekOverlay({ weekNum, active }: { weekNum: number; active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: weekDropId(weekNum), disabled: !active });
  return (
    <div
      ref={setNodeRef}
      className="pointer-events-none absolute inset-0 rounded-xl transition-all"
      style={{
        border: isOver ? '2px dashed #2D6A4F' : '2px dashed transparent',
        background: isOver ? 'rgba(45,106,79,0.06)' : 'transparent',
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScheduleView({ progress, initialOverrides, metas, hiddenTopics = [] }: {
  progress: ProgressMap;
  initialOverrides: OverrideMap;
  metas: MetaOverrideMap;
  hiddenTopics?: string[];
}) {
  const hiddenSet = new Set(hiddenTopics);
  const currentWeek = getCurrentWeek();
  const isFuture = Date.now() < WEEK1_START.getTime();
  const [openWeek, setOpenWeek] = useState<number | null>(currentWeek);
  const [overrides, setOverrides] = useState<OverrideMap>(initialOverrides);
  const [activePillId, setActivePillId] = useState<string | null>(null);

  const buckets = useMemo(() => buildWeekBuckets(overrides), [overrides]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const persistPositions = useCallback(async (topicId: string, positions: Position[]) => {
    try {
      await fetch('/api/schedule-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, positions }),
      });
    } catch { /* fire-and-forget */ }
  }, []);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActivePillId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActivePillId(null);
    const { active, over } = e;
    if (!over) return;
    const pill = parsePillDragId(String(active.id));
    const targetWeek = parseWeekDropId(String(over.id));
    if (!pill || targetWeek == null) return;

    const topic = findTopicById(pill.topicId);
    if (!topic) return;
    const positions = getEffectivePositions(topic, overrides).slice();
    const current = positions[pill.positionIndex];
    if (!current) return;
    const sourceWeek = parseInt(current.week.slice(1));
    if (sourceWeek === targetWeek) return; // same week — no-op

    // Autoplace side using the target bucket AS IT WILL BE AFTER removing the pill.
    // Since the pill isn't in the target bucket yet, buckets[targetWeek] already excludes it.
    const target: WeekBucket = buckets[targetWeek] ?? { weekdayPills: [], weekendPills: [] };
    const newSide = autoplaceSide(target, current.side, overrides);

    positions[pill.positionIndex] = { week: `W${targetWeek}`, side: newSide };
    setOverrides(prev => ({ ...prev, [pill.topicId]: positions }));
    void persistPositions(pill.topicId, positions);
  }, [overrides, buckets, persistPositions]);

  // Active pill for the drag overlay
  const activePill = activePillId ? parsePillDragId(activePillId) : null;
  const activeTopic = activePill ? findTopicById(activePill.topicId) : null;
  const activeTrack = activePill ? findTrackForTopic(activePill.topicId) : null;
  const activeStatus = activePill ? (progress[activePill.topicId] ?? 'not_started') : 'not_started';

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-3">
        {WEEKS.map((w, i) => {
          const weekNum = i + 1;
          const isCurrent = weekNum === currentWeek;
          const isOpen = openWeek === weekNum;
          const bucket = buckets[weekNum];
          const weekdayPills = bucket.weekdayPills.filter(p => !hiddenSet.has(p.topicId));
          const weekendPills = bucket.weekendPills.filter(p => !hiddenSet.has(p.topicId));
          const allPills: PillRef[] = [...weekdayPills, ...weekendPills];
          const doneCount = allPills.filter(p => progress[p.topicId] === 'done').length;
          const weekdayHours = sumPillHours(weekdayPills, overrides);
          const weekendHours = sumPillHours(weekendPills, overrides);
          const totalHours = weekdayHours + weekendHours;

          return (
            <div key={w.week} className="relative bg-white rounded-xl overflow-hidden transition-all"
              style={{ border: isCurrent ? '2px solid #2D6A4F' : '1px solid #E8E4DE' }}>

              <button onClick={() => setOpenWeek(isOpen ? null : weekNum)}
                className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-left ${isCurrent ? 'bg-[#F0F9F4] hover:bg-[#EAF5EE]' : 'hover:bg-[#FAF8F5]'}`}>
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
                  <span className="text-[11px] text-[#9B9590] shrink-0">{doneCount}/{allPills.length} done</span>
                  <span className="text-[11px] font-semibold text-[#4A4540] shrink-0">{totalHours}h</span>
                </div>
                <svg className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {!isOpen && (
                <>
                  <div className="px-5 pb-3.5 flex flex-wrap gap-1.5 relative z-10">
                    {allPills.map(p => {
                      const topic = findTopicById(p.topicId);
                      const track = findTrackForTopic(p.topicId);
                      if (!topic || !track) return null;
                      const status = progress[p.topicId] ?? 'not_started';
                      return (
                        <DraggablePill
                          key={`${p.topicId}-${p.positionIndex}`}
                          pill={p}
                          topic={topic}
                          track={track}
                          status={status}
                          disabled={false}
                        />
                      );
                    })}
                    {allPills.length === 0 && (
                      <span className="text-[11px] italic text-[#C8C2BA]">Drop a pill here</span>
                    )}
                  </div>
                  <DropWeekOverlay weekNum={weekNum} active={true} />
                </>
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
                    hoursPerDay={Math.max(2, Math.ceil(weekdayHours / 5))}
                    pills={weekdayPills} progress={progress} overrides={overrides} metas={metas} />
                  <DaySection emoji="🌿" dayLabels={['Sat', 'Sun']}
                    hoursPerDay={Math.max(3, Math.ceil(weekendHours / 2))}
                    pills={weekendPills} progress={progress} overrides={overrides} metas={metas} />
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

      <DragOverlay dropAnimation={null}>
        {activePill && activeTopic && activeTrack ? (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full border select-none inline-block"
            style={{
              borderColor: activeTrack.color,
              color: statusTextColor(activeStatus, activeTrack),
              background: statusBg(activeStatus, activeTrack),
              boxShadow: '0 6px 14px rgba(28,28,26,0.18)',
              transform: 'rotate(-2deg)',
            }}
          >
            {activeTopic.id}
          </span>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
