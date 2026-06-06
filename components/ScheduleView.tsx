'use client';

import { useState } from 'react';
import Link from 'next/link';
import { WEEKS, findTopicById, findTrackForTopic } from '@/lib/data';
import type { ProgressMap } from '@/lib/types';

function parseTopicIds(text: string): string[] {
  return (text.match(/\((\d+\.\d+)\)/g) ?? []).map(m => m.slice(1, -1));
}

function weeklyHours(topicId: string): number {
  const topic = findTopicById(topicId);
  if (!topic) return 0;
  const span = topic.week.match(/W\d+[–\-]\d+/);
  if (span) {
    const parts = topic.week.replace('–', '-').split('-');
    const count = parseInt(parts[1].replace('W', '')) - parseInt(parts[0].replace('W', '')) + 1;
    return Math.ceil(topic.hours / count);
  }
  return topic.hours;
}

interface GanttSectionProps {
  label: string;
  subLabel: string;
  emoji: string;
  totalHours: number;
  topicIds: string[];
  progress: ProgressMap;
}

function GanttSection({ label, subLabel, emoji, totalHours, topicIds, progress }: GanttSectionProps) {
  if (topicIds.length === 0) return null;

  const entries = topicIds
    .map(id => ({ id, topic: findTopicById(id), track: findTrackForTopic(id), hours: weeklyHours(id) }))
    .filter(e => e.topic && e.track);

  const totalUsed = entries.reduce((s, e) => s + e.hours, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9B9590]">
          {emoji} {label}
        </span>
        <span className="text-[10px] text-[#C8C2BA]">{subLabel}</span>
      </div>

      {/* Proportional bar */}
      <div className="flex h-7 rounded-lg overflow-hidden mb-2" style={{ background: '#F0EDE8' }}>
        {entries.map(({ id, topic, track, hours }) => {
          const width = (hours / totalHours) * 100;
          const isDone = progress[id] === 'done';
          return (
            <Link
              key={id}
              href={`/topic/${id}`}
              className="flex items-center justify-center overflow-hidden hover:brightness-95 transition-all"
              style={{
                width: `${width}%`,
                background: isDone ? track!.color : track!.accent,
                borderRight: '2px solid #FAF8F5',
                minWidth: '28px',
              }}
              title={`${topic!.title} · ${hours}h`}
            >
              <span
                className="text-[10px] font-semibold truncate px-0.5"
                style={{ color: isDone ? '#FAF8F5' : track!.color }}
              >
                {topic!.id}
              </span>
            </Link>
          );
        })}
        {totalUsed < totalHours && (
          <div className="flex-1" style={{ background: '#F0EDE8' }} />
        )}
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
              {isDone && (
                <span className="text-[10px] shrink-0" style={{ color: track!.color }}>✓</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  progress: ProgressMap;
}

export default function ScheduleView({ progress }: Props) {
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {WEEKS.map((w, i) => {
        const weekNum = i + 1;
        const isOpen = openWeek === weekNum;
        const weekdayIds = parseTopicIds(w.weekday);
        const weekendIds = parseTopicIds(w.weekend);
        const allIds = [...weekdayIds, ...weekendIds];
        const doneCount = allIds.filter(id => progress[id] === 'done').length;

        return (
          <div
            key={w.week}
            className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden"
          >
            {/* Header row */}
            <button
              onClick={() => setOpenWeek(isOpen ? null : weekNum)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAF8F5] transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] shrink-0">
                  Week {weekNum}
                </h2>
                <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2.5 py-0.5 rounded-full shrink-0">
                  {w.week}
                </span>
                <span className="text-[11px] text-[#9B9590] shrink-0">
                  {doneCount}/{allIds.length} done
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-[#9B9590] shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsed: topic pills */}
            {!isOpen && (
              <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                {allIds.map(id => {
                  const topic = findTopicById(id);
                  const track = findTrackForTopic(id);
                  if (!topic || !track) return null;
                  const isDone = progress[id] === 'done';
                  return (
                    <Link
                      key={id}
                      href={`/topic/${id}`}
                      className="text-[10px] px-2 py-0.5 rounded-full border transition-all hover:brightness-95"
                      style={{
                        borderColor: track.color,
                        color: isDone ? '#FAF8F5' : track.color,
                        background: isDone ? track.color : track.accent,
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {topic.id}{isDone ? ' ✓' : ''}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Expanded: Gantt + artifacts */}
            {isOpen && (
              <div className="px-5 pb-5 border-t border-[#EEE9E2] pt-4 space-y-5">
                <GanttSection
                  label="Mon – Fri"
                  subLabel="10 hrs/week"
                  emoji="⏱"
                  totalHours={10}
                  topicIds={weekdayIds}
                  progress={progress}
                />
                <GanttSection
                  label="Sat – Sun"
                  subLabel="8 hrs/weekend"
                  emoji="🌿"
                  totalHours={8}
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
