import AppNav from '@/components/AppNav';
import { ONBOARDING_TOPICS } from '@/lib/data';

export default function OnboardingPlan() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Topics
          </h1>
          <p className="text-sm text-[#6B6560]">Onboarding knowledge areas — topics being confirmed</p>
        </div>

        <div className="space-y-4">
          {ONBOARDING_TOPICS.map(l1 => (
            <div key={l1.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-[#F0EDE8]">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l1.color }} />
                <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A]">
                  {l1.label}
                </h2>
              </div>
              <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                  style={{ background: l1.accent }}>
                  <span className="text-[14px]">⏳</span>
                </div>
                <p className="text-[13px] font-medium text-[#4A4540]">Topics coming soon</p>
                <p className="text-[11px] text-[#9B9590]">L2 topics for this track will be added before you join.</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
