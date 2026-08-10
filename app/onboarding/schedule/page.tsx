import AppNav from '@/components/AppNav';
import OnboardingScheduleView from '@/components/OnboardingScheduleView';
import type { ScheduleTopic } from '@/components/OnboardingScheduleView';
import { ONBOARDING_TOPICS, resolveMeta } from '@/lib/data';
import { getAllProgress, getAllMetaOverrides } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function OnboardingSchedule() {
  const [progress, metas] = await Promise.all([getAllProgress(), getAllMetaOverrides()]);

  const topics: ScheduleTopic[] = ONBOARDING_TOPICS.flatMap(l1 =>
    l1.categories.flatMap(c =>
      c.topics.map(t => {
        const m = resolveMeta(t, metas);
        return { id: t.id, title: m.title, desc: m.desc, hours: t.hours };
      })
    )
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-1">
            Weekly schedule
          </h1>
          <p className="text-sm text-[#6B6560]">
            Click a week to see the daily breakdown
          </p>
        </div>
        <OnboardingScheduleView topics={topics} progress={progress} />
      </div>
    </div>
  );
}
