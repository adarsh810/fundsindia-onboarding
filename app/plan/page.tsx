import Link from 'next/link';
import AppNav from '@/components/AppNav';
import { getAllProgress } from '@/lib/supabase';
import { TOPICS } from '@/lib/data';
import type { Status } from '@/lib/types';

export const dynamic = 'force-dynamic';

const STATUS_COLORS: Record<Status, string> = {
  not_started: '#E8E0D5',
  in_progress: '#F4C97A',
  done:        '#6DB07A',
};
const STATUS_LABELS: Record<Status, string> = {
  not_started: 'Start',
  in_progress: 'Active',
  done:        'Done',
};
const STATUS_TEXT: Record<Status, string> = {
  not_started: '#6B6560',
  in_progress: '#7A5010',
  done:        '#1B5E2A',
};

interface Props { searchParams: Promise<{ track?: string }> }

export default async function PlanPage({ searchParams }: Props) {
  const { track: activeTrack } = await searchParams;
  const progress = await getAllProgress();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-4">Learning plan</h1>
          <div className="flex gap-2 flex-wrap">
            <Link href="/plan" className={`text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all ${
              !activeTrack ? 'bg-[#1C1C1A] text-white border-[#1C1C1A]' : 'bg-[#EEEBE5] text-[#4A4540] border-transparent hover:border-[#D5CFC8]'
            }`}>
              All tracks
            </Link>
            {TOPICS.map(l1 => {
              const l1topics = l1.categories.flatMap(c => c.topics);
              const done = l1topics.filter(t => progress[t.id] === 'done').length;
              const isActive = activeTrack === l1.id;
              return (
                <Link key={l1.id} href={isActive ? '/plan' : `/plan?track=${l1.id}`}
                  className="text-xs px-3.5 py-1.5 rounded-full border font-medium transition-all"
                  style={{
                    background: isActive ? l1.color : l1.accent,
                    color: isActive ? '#fff' : l1.color,
                    borderColor: isActive ? l1.color : 'transparent',
                  }}>
                  {l1.label} · {done}/{l1topics.length}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-10">
          {TOPICS.filter(l1 => !activeTrack || l1.id === activeTrack).map(l1 => (
            <div key={l1.id}>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l1.color }} />
                <h2 className="font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#1C1C1A]">{l1.label}</h2>
                <span className="text-xs text-[#9B9590]">{l1.hours}h</span>
              </div>

              {l1.categories.map(cat => (
                <div key={cat.name} className="mt-4">
                  <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9B9590] mb-2.5">{cat.name}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {cat.topics.map(t => {
                      const status: Status = (progress[t.id] as Status) ?? 'not_started';
                      return (
                        <Link key={t.id} href={`/topic/${t.id}`}
                          className="block border border-[#E8E4DE] rounded-xl p-3.5 bg-white hover:border-[#C8C2BA] hover:shadow-sm transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: l1.accent, color: l1.color }}>{t.id}</span>
                              <span className="text-[10px] text-[#9B9590]">{t.week} · {t.hours}h</span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full"
                              style={{ background: STATUS_COLORS[status], color: STATUS_TEXT[status] }}>
                              <span className="w-1 h-1 rounded-full inline-block" style={{ background: STATUS_TEXT[status] }} />
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-[#1C1C1A] mb-1 group-hover:underline">{t.title}</p>
                          <p className="text-[11px] text-[#7A7570] leading-snug line-clamp-2">{t.desc}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
