import Link from 'next/link';
import AppNav from '@/components/AppNav';
import TrackStatusPill from '@/components/TrackStatusPill';
import { getAllProgress } from '@/lib/supabase';
import { TOPICS, ALL_TOPICS, TOTAL_HOURS, findTrackForTopic } from '@/lib/data';

export const dynamic = 'force-dynamic';

const STATUS_DOT: Record<string, string> = {
  not_started: '#9B9590',
  in_progress: '#F4C97A',
  done:        '#6DB07A',
};

export default async function Dashboard() {
  const progress = await getAllProgress();

  const doneCount  = ALL_TOPICS.filter(t => progress[t.id] === 'done').length;
  const activeCount = ALL_TOPICS.filter(t => progress[t.id] === 'in_progress').length;
  const doneHours  = ALL_TOPICS.filter(t => progress[t.id] === 'done').reduce((a, t) => a + t.hours, 0);
  const pct        = Math.round((doneCount / ALL_TOPICS.length) * 100);

  const WEEK1_START = new Date('2026-06-08T00:00:00+05:30');
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
  const currentWeek = Math.min(Math.max(Math.floor((Date.now() - WEEK1_START.getTime()) / MS_PER_WEEK) + 1, 1), 10);

  function topicStartWeek(w: string): number {
    const simple = w.match(/^W(\d+)$/);
    if (simple) return parseInt(simple[1]);
    const range = w.match(/^W(\d+)[–\-]/);
    if (range) return parseInt(range[1]);
    const comma = w.match(/^W(\d+),/);
    if (comma) return parseInt(comma[1]);
    return 99;
  }

  function topicEndWeek(w: string): number {
    const range = w.match(/W\d+[–\-](\d+)/);
    if (range) return parseInt(range[1]);
    const comma = w.match(/W\d+,\s*(\d+)/);
    if (comma) return parseInt(comma[1]);
    const simple = w.match(/^W(\d+)$/);
    if (simple) return parseInt(simple[1]);
    return 99;
  }

  const expectedHours = ALL_TOPICS
    .filter(t => topicEndWeek(t.week) <= currentWeek)
    .reduce((a, t) => a + t.hours, 0);

  // In-progress topics count at 30% — fairer than 0%
  const adjustedDoneHours =
    doneHours +
    ALL_TOPICS
      .filter(t => progress[t.id] === 'in_progress')
      .reduce((a, t) => a + t.hours * 0.3, 0);

  const trackRatio = expectedHours > 0 ? adjustedDoneHours / expectedHours : 1;
  const trackStatus = trackRatio >= 0.9
    ? { label: 'On track', bg: '#D1FAE5', text: '#065F46' }
    : trackRatio >= 0.6
    ? { label: 'Slightly behind', bg: '#FEF3C7', text: '#92400E' }
    : { label: 'Off track', bg: '#FEE2E2', text: '#991B1B' };

  const overdueTopics = ALL_TOPICS
    .filter(t => topicEndWeek(t.week) <= currentWeek && progress[t.id] !== 'done')
    .sort((a, b) => topicEndWeek(a.week) - topicEndWeek(b.week))
    .map(t => ({ title: t.title, hours: t.hours, week: t.week }));

  const inProgress = ALL_TOPICS.filter(t => progress[t.id] === 'in_progress');
  const notStarted = ALL_TOPICS
    .filter(t => (progress[t.id] ?? 'not_started') === 'not_started')
    .sort((a, b) => topicStartWeek(a.week) - topicStartWeek(b.week));
  const nextTopics = [...inProgress, ...notStarted].slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Your learning journey
          </h1>
          <p className="text-sm text-[#6B6560]">June 8 → August 8, 2026 · FundsIndia joins in 2 months</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Topics done',   value: doneCount,   suffix: `/${ALL_TOPICS.length}`, color: '#6DB07A' },
            { label: 'In progress',   value: activeCount, suffix: ' topics',               color: '#F4C97A' },
            { label: 'Hours covered', value: doneHours,   suffix: `/${TOTAL_HOURS}h`,      color: '#A89FD8' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#E8E4DE] rounded-xl p-4 sm:p-5">
              <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em] mb-2">{m.label}</p>
              <p className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-bold leading-none" style={{ color: m.color }}>
                {m.value}<span className="text-sm font-normal text-[#9B9590] font-[family-name:var(--font-dm)]">{m.suffix}</span>
              </p>
            </div>
          ))}

          {/* Overall card with track status pill */}
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-4 sm:p-5">
            <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em] mb-2">Overall</p>
            <p className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-bold leading-none text-[#7EB8A4] mb-2">
              {pct}%
            </p>
            <TrackStatusPill
              label={trackStatus.label}
              bg={trackStatus.bg}
              textColor={trackStatus.text}
              ratio={trackRatio}
              hoursExpected={expectedHours}
              adjustedHoursDone={adjustedDoneHours}
              overdueTopics={overdueTopics}
            />
          </div>
        </div>

        {/* Track progress */}
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold mb-5">Progress by track</h2>
          <div className="space-y-5">
            {TOPICS.map(l1 => {
              const l1topics = l1.categories.flatMap(c => c.topics);
              const done = l1topics.filter(t => progress[t.id] === 'done').length;
              const active = l1topics.filter(t => progress[t.id] === 'in_progress').length;
              const pctDone = Math.round((done / l1topics.length) * 100);
              return (
                <Link key={l1.id} href={`/plan?track=${l1.id}`} className="block group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l1.color }} />
                      <span className="text-sm font-medium text-[#1C1C1A] group-hover:underline">{l1.label}</span>
                      {active > 0 && (
                        <span className="text-[10px] font-medium text-[#7A5010] bg-[#FEF0C7] px-2 py-0.5 rounded-full">{active} active</span>
                      )}
                    </div>
                    <span className="text-xs text-[#9B9590]">{done}/{l1topics.length} · {l1.hours}h</span>
                  </div>
                  <div className="h-1.5 bg-[#E8E4DE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: l1.color }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* What to do now */}
        <div className="bg-[#1C1C1A] rounded-xl p-5 sm:p-6 text-[#FAF8F5]">
          <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold mb-1">What to do now</h2>
          <p className="text-xs text-[#6B6560] mb-5">Next 3 topics to start based on the weekly schedule</p>
          <div className="space-y-0 divide-y divide-[#2D2D2A]">
            {nextTopics.map(t => {
              const track = findTrackForTopic(t.id)!;
              return (
                <Link key={t.id} href={`/topic/${t.id}`} className="flex items-center gap-3 py-3 group">
                  <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ background: track.color }}>
                    {t.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:underline">{t.title}</p>
                    <p className="text-[11px] text-[#6B6560]">{t.week} · {t.hours}h · {track.label}</p>
                  </div>
                  <span className="text-[#6B6560] group-hover:text-[#FAF8F5] transition-colors">→</span>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
