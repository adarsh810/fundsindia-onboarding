import AppNav from '@/components/AppNav';
import { ONBOARDING_TOPICS } from '@/lib/data';

export default function OnboardingDashboard() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Onboarding KT
          </h1>
          <p className="text-sm text-[#6B6560]">Your structured knowledge transfer for Day 1 and beyond</p>
        </div>

        {/* Stats placeholder */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Topics done',   value: '—' },
            { label: 'In progress',   value: '—' },
            { label: 'Hours covered', value: '—' },
            { label: 'Overall',       value: '—' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#E8E4DE] rounded-xl p-4 sm:p-5">
              <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em] mb-2">{m.label}</p>
              <p className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-bold leading-none text-[#C8C2BA]">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Track progress */}
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold mb-5">Progress by track</h2>
          <div className="space-y-5">
            {ONBOARDING_TOPICS.map(l1 => (
              <div key={l1.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l1.color }} />
                    <span className="text-sm font-medium text-[#1C1C1A]">{l1.label}</span>
                    <span className="text-[10px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full">Coming soon</span>
                  </div>
                  <span className="text-xs text-[#C8C2BA]">0/0</span>
                </div>
                <div className="h-1.5 bg-[#E8E4DE] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '0%', background: l1.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="bg-[#1C1C1A] rounded-xl p-5 sm:p-6 text-[#FAF8F5]">
          <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold mb-1">What to do now</h2>
          <p className="text-xs text-[#6B6560] mb-6">Next topics to start based on your onboarding schedule</p>
          <div className="flex flex-col items-center py-6 gap-2">
            <p className="text-[13px] text-[#6B6560]">Onboarding topics are being set up.</p>
            <p className="text-[11px] text-[#4A4540]">Check back once you join — your manager will populate this.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
