import AppNav from '@/components/AppNav';
import OnboardingPlanClient from '@/components/OnboardingPlanClient';
import { ONBOARDING_TOPICS } from '@/lib/data';
import {
  getAllProgress, getAllMetaOverrides, getAllL1Overrides,
  getCustomL1Tracks, getCustomTopics, getHiddenTopics,
} from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function OnboardingPlan() {
  const [progress, metas, l1Overrides, customL1, customTopics, hiddenSet] = await Promise.all([
    getAllProgress(),
    getAllMetaOverrides(),
    getAllL1Overrides('onboarding'),
    getCustomL1Tracks('onboarding'),
    getCustomTopics('onboarding'),
    getHiddenTopics(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Onboarding KT
          </h1>
          <p className="text-sm text-[#6B6560]">Knowledge transfer topics · click ✎ to rename, ✕ to remove, + to add</p>
        </div>

        <OnboardingPlanClient
          staticTracks={ONBOARDING_TOPICS}
          l1Overrides={l1Overrides}
          customL1Tracks={customL1}
          customTopics={customTopics}
          hiddenTopics={[...hiddenSet]}
          progress={progress}
          metas={metas}
          section="onboarding"
        />
      </div>
    </div>
  );
}
