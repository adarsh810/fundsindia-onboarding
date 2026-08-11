'use client';

import { useState } from 'react';

export default function OverallProgress({
  topicDone, topicTotal,
  resourceDone, resourceTotal,
  color,
}: {
  topicDone: number; topicTotal: number;
  resourceDone: number; resourceTotal: number;
  color: string;
}) {
  const [mode, setMode] = useState<'topics' | 'docs'>('topics');

  const pct  = mode === 'topics'
    ? (topicTotal    > 0 ? Math.round((topicDone    / topicTotal)    * 100) : 0)
    : (resourceTotal > 0 ? Math.round((resourceDone / resourceTotal) * 100) : 0);
  const done  = mode === 'topics' ? topicDone    : resourceDone;
  const total = mode === 'topics' ? topicTotal   : resourceTotal;

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em]">Overall</p>
        <div className="flex items-center gap-0.5 bg-[#F0EDE8] rounded-full p-0.5">
          {(['topics', 'docs'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`text-[9px] font-semibold px-2 py-0.5 rounded-full transition-all ${
                mode === m ? 'bg-white shadow-sm text-[#1C1C1A]' : 'text-[#9B9590] hover:text-[#4A4540]'
              }`}
            >
              {m === 'topics' ? 'Topics' : 'Docs'}
            </button>
          ))}
        </div>
      </div>
      <p className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-bold leading-none" style={{ color }}>
        {pct}%
      </p>
      <p className="text-[11px] text-[#9B9590] mt-1">{done}/{total} {mode === 'topics' ? 'topics' : 'docs'}</p>
    </>
  );
}
