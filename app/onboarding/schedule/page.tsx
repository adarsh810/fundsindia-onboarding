import AppNav from '@/components/AppNav';
import OnboardingScheduleView from '@/components/OnboardingScheduleView';
import type { ScheduleTopic } from '@/components/OnboardingScheduleView';
import { ONBOARDING_TOPICS, resolveMeta } from '@/lib/data';
import { getAllProgress, getAllMetaOverrides, getCustomTopics, getHiddenTopics, getCustomL1Tracks } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function OnboardingSchedule() {
  const [progress, metas, customTopics, hiddenSet, customL1Tracks] = await Promise.all([
    getAllProgress(),
    getAllMetaOverrides(),
    getCustomTopics('onboarding'),
    getHiddenTopics(),
    getCustomL1Tracks('onboarding'),
  ]);

  // Valid L1 IDs: static tracks + existing custom tracks
  const validL1Ids = new Set([
    ...ONBOARDING_TOPICS.map(l => l.id),
    ...customL1Tracks.map(l => l.id),
  ]);

  const topics: ScheduleTopic[] = [
    ...ONBOARDING_TOPICS.flatMap(l1 =>
      l1.categories.flatMap(c =>
        c.topics
          .filter(t => !hiddenSet.has(t.id))
          .map(t => {
            const m = resolveMeta(t, metas);
            return { id: t.id, title: m.title, desc: m.desc, hours: t.hours };
          })
      )
    ),
    // Only include custom topics whose parent track still exists
    ...customTopics
      .filter(ct => validL1Ids.has(ct.l1Id))
      .map(ct => ({
        id: ct.id,
        title: metas[ct.id]?.title?.trim() || ct.title,
        desc:  metas[ct.id]?.desc?.trim()  || ct.desc,
        hours: ct.hours,
      })),
  ];

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
