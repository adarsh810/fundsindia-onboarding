'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { L1Track, ProgressMap, Status } from '@/lib/types';
import type { MetaOverrideMap } from '@/lib/supabase';

function TopicList({ track, currentId, progress, metas, onNavigate }: {
  track: L1Track; currentId: string; progress: ProgressMap; metas: MetaOverrideMap; onNavigate?: () => void;
}) {
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: track.color }}>{track.label}</p>
      <div className="space-y-4">
        {track.categories.map(cat => (
          <div key={cat.name}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#C8C2BA] mb-1">{cat.name}</p>
            <div className="space-y-0.5">
              {cat.topics.map(t => {
                const isCurrent = t.id === currentId;
                const tStatus = (progress[t.id] as Status) ?? 'not_started';
                return (
                  <Link key={t.id} href={`/topic/${t.id}`} onClick={onNavigate}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group"
                    style={isCurrent ? { background: track.accent } : {}}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                      background: tStatus === 'done' ? track.color : tStatus === 'in_progress' ? '#F4C97A' : '#D5CFC8',
                    }} />
                    <span className="font-mono text-[9px] shrink-0" style={{ color: isCurrent ? track.color : '#9B9590' }}>{t.id}</span>
                    <span className={`text-[11px] truncate transition-colors ${isCurrent ? 'font-semibold' : 'text-[#6B6560] group-hover:text-[#1C1C1A]'}`}
                      style={isCurrent ? { color: track.color } : {}}
                    >{metas[t.id]?.title?.trim() || t.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function TopicSidebar({ track, currentId, progress, metas }: {
  track: L1Track; currentId: string; progress: ProgressMap; metas: MetaOverrideMap;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile trigger — fixed chevron top-right */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-[4.75rem] right-4 z-30 w-8 h-8 rounded-full bg-white border border-[#E8E4DE] shadow-sm flex items-center justify-center"
        aria-label="Open topics"
      >
        <svg className="w-4 h-4 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-72 h-full bg-[#FAF8F5] overflow-y-auto p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">Topics</p>
              <button onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#EEE9E2] transition-colors">
                <svg className="w-4 h-4 text-[#6B6560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TopicList track={track} currentId={currentId} progress={progress} metas={metas} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-52 shrink-0 self-stretch">
        <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto">
          <TopicList track={track} currentId={currentId} progress={progress} metas={metas} />
        </div>
      </aside>
    </>
  );
}
