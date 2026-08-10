import Link from 'next/link';
import AppNav from '@/components/AppNav';
import { ONBOARDING_TOPICS, resolveMeta } from '@/lib/data';
import { getAllProgress, getAllMetaOverrides } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLORS = { not_started: '#C8C2BA', in_progress: '#F4C97A', done: '#6DB07A' };

export default async function OnboardingSchedule() {
  const [progress, metas] = await Promise.all([getAllProgress(), getAllMetaOverrides()]);

  // Get all populated onboarding topics in order
  const allTopics = ONBOARDING_TOPICS.flatMap(l1 =>
    l1.categories.flatMap(c => c.topics.map(t => ({ ...t, l1 })))
  );

  // Compute "today" — what day of week is it? (0=Mon … 6=Sun)
  // We compute dates starting from this week's Monday
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sun, 1=Mon, ...
  const dayIndex = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon … 6=Sun

  // Monday of this week
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIndex);

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-1">
            Onboarding Schedule
          </h1>
          <p className="text-sm text-[#6B6560]">
            FundsIndia 101 — finish by Sunday ·{' '}
            <span className="font-semibold text-[#6B3FA0]">{allTopics.filter(t => progress[t.id] === 'done').length}/{allTopics.length} done</span>
          </p>
        </div>

        <div className="space-y-3">
          {DAYS.map((day, i) => {
            const topic = allTopics[i];
            const date  = weekDates[i];
            const isToday = i === dayIndex;
            const isPast  = i < dayIndex;
            const status  = topic ? (progress[topic.id] ?? 'not_started') as keyof typeof COLORS : 'not_started';
            const meta    = topic ? resolveMeta(topic, metas) : null;
            const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            return (
              <div
                key={day}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isToday ? 'border-[#6B3FA0] shadow-[0_2px_12px_rgba(107,63,160,0.12)]' : 'border-[#E8E4DE]'
                } ${isPast && !topic ? 'opacity-50' : ''}`}
              >
                <div className={`flex items-stretch ${isToday ? 'bg-[#F8F4FF]' : ''}`}>
                  {/* Day pill */}
                  <div className={`w-16 sm:w-20 shrink-0 flex flex-col items-center justify-center px-2 py-4 ${
                    isToday ? 'bg-[#6B3FA0]' : isPast ? 'bg-[#F5F2EE]' : 'bg-[#FAF8F5]'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${isToday ? 'text-[#D7BDE2]' : 'text-[#9B9590]'}`}>{day}</span>
                    <span className={`text-[18px] font-bold font-[family-name:var(--font-playfair)] ${isToday ? 'text-white' : isPast ? 'text-[#9B9590]' : 'text-[#1C1C1A]'}`}>
                      {date.getDate()}
                    </span>
                    <span className={`text-[9px] ${isToday ? 'text-[#D7BDE2]' : 'text-[#C8C2BA]'}`}>{dateStr.split(' ')[1]}</span>
                  </div>

                  {/* Topic */}
                  {topic ? (
                    <Link href={`/topic/${topic.id}`} className="flex-1 flex items-center gap-3 px-4 py-3 group hover:bg-[#FAF8F5] transition-colors">
                      {/* Status dot */}
                      <div className="w-3 h-3 rounded-full shrink-0 border-2" style={{
                        background: status === 'not_started' ? 'transparent' : COLORS[status],
                        borderColor: COLORS[status],
                      }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold group-hover:text-black transition-colors truncate ${
                          status === 'done' ? 'text-[#9B9590] line-through' : 'text-[#1C1C1A]'
                        }`}>{meta?.title}</p>
                        <p className="text-[11px] text-[#9B9590] truncate mt-0.5">{meta?.desc}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[11px] font-medium text-[#6B3FA0]">{topic.hours}h</p>
                        {isToday && <p className="text-[9px] text-[#6B3FA0] font-semibold uppercase tracking-wide">Today</p>}
                      </div>
                      <svg className="w-3.5 h-3.5 text-[#D5CFC8] group-hover:text-[#9B9590] transition-colors shrink-0"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    <div className="flex-1 flex items-center px-4 py-3">
                      <p className="text-[12px] text-[#C8C2BA] italic">No topic scheduled</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week summary */}
        <div className="mt-6 bg-white border border-[#E8E4DE] rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="text-center">
            <p className="text-[22px] font-bold font-[family-name:var(--font-playfair)] text-[#6B3FA0]">
              {allTopics.filter(t => progress[t.id] === 'done').length}
            </p>
            <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em]">done</p>
          </div>
          <div className="flex-1 h-2 bg-[#E8E4DE] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500 bg-[#6B3FA0]"
              style={{ width: `${allTopics.length ? Math.round(allTopics.filter(t => progress[t.id] === 'done').length / allTopics.length * 100) : 0}%` }} />
          </div>
          <div className="text-center">
            <p className="text-[22px] font-bold font-[family-name:var(--font-playfair)] text-[#1C1C1A]">
              {allTopics.reduce((a, t) => a + t.hours, 0)}h
            </p>
            <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em]">total</p>
          </div>
        </div>

      </div>
    </div>
  );
}
