import AppNav from '@/components/AppNav';

export default function OnboardingSchedule() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Schedule
          </h1>
          <p className="text-sm text-[#6B6560]">Week-by-week onboarding plan</p>
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-xl p-10 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8] flex items-center justify-center text-[22px] mb-2">
            📅
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-[20px] font-semibold text-[#1C1C1A]">
            Schedule being built
          </h2>
          <p className="text-[13px] text-[#6B6560] max-w-sm leading-relaxed">
            Your onboarding schedule will be set up once topics are confirmed. Check back after Day 1.
          </p>
        </div>

      </div>
    </div>
  );
}
