'use client';

import { useState } from 'react';

interface OverdueTopic { title: string; hours: number; week: string }

interface Props {
  label: string;
  bg: string;
  textColor: string;
  ratio: number;
  hoursExpected: number;
  adjustedHoursDone: number;
  overdueTopics: OverdueTopic[];
}

export default function TrackStatusPill({
  label, bg, textColor, ratio, hoursExpected, adjustedHoursDone, overdueTopics,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const isOnTrack = ratio >= 0.9;
  const hoursGap = Math.max(0, Math.round(hoursExpected - adjustedHoursDone));

  return (
    <div className="relative inline-block">
      <span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-default select-none"
        style={{ background: bg, color: textColor }}
      >
        {label}
        <span style={{ opacity: 0.6 }}>· {Math.round(ratio * 100)}% of target</span>
      </span>

      {isOnTrack && hovered && (
        <div className="absolute left-0 top-full mt-2 z-50 w-56 bg-[#1C1C1A] text-[#FAF8F5] rounded-xl p-3.5 shadow-xl text-[11px] leading-relaxed">
          <p className="font-semibold text-[#6DB07A] mb-1">Solid progress.</p>
          <p className="text-[#9B9590]">You&apos;re keeping pace with the schedule. Stay consistent and the rest will follow.</p>
        </div>
      )}

      {!isOnTrack && hovered && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 bg-[#1C1C1A] text-[#FAF8F5] rounded-xl p-3.5 shadow-xl text-[11px]">
          <p className="font-semibold mb-2.5" style={{ color: '#F4C97A' }}>
            ~{hoursGap}h behind schedule
          </p>
          {overdueTopics.length > 0 && (
            <>
              <p className="text-[#9B9590] mb-1.5 text-[10px] uppercase tracking-[0.06em] font-semibold">Overdue</p>
              <ul className="space-y-1.5 mb-3">
                {overdueTopics.slice(0, 5).map((t, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-[#6B6560] shrink-0 mt-px">–</span>
                    <span>
                      {t.title}
                      <span className="text-[#6B6560]"> · {t.hours}h · {t.week}</span>
                    </span>
                  </li>
                ))}
                {overdueTopics.length > 5 && (
                  <li className="text-[#6B6560]">+{overdueTopics.length - 5} more</li>
                )}
              </ul>
            </>
          )}
          <p className="text-[#9B9590] text-[10px] leading-relaxed border-t border-[#2D2D2A] pt-2.5">
            Pick up the earliest overdue topics first — they unblock later weeks.
          </p>
        </div>
      )}
    </div>
  );
}
