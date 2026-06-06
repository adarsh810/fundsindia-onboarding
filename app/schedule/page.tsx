import AppNav from '@/components/AppNav';
import { WEEKS } from '@/lib/data';

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-1">Weekly schedule</h1>
          <p className="text-sm text-[#6B6560]">10 hrs weekdays · 8 hrs weekends · 18 hrs/week</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {WEEKS.map((w, i) => (
            <div key={w.week} className="bg-white border border-[#E8E4DE] rounded-xl p-5 hover:border-[#C8C2BA] hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-bold text-[#1C1C1A]">Week {i + 1}</h2>
                <span className="text-[11px] text-[#9B9590] bg-[#F0EDE8] px-2.5 py-1 rounded-full">{w.week}</span>
              </div>

              <div className="space-y-3 mb-3">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9590] mb-1">⏱ Weekdays</p>
                  <p className="text-[12px] text-[#4A4540] leading-relaxed">{w.weekday}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9590] mb-1">🌿 Weekends</p>
                  <p className="text-[12px] text-[#4A4540] leading-relaxed">{w.weekend}</p>
                </div>
              </div>

              <div className="border-t border-[#EEE9E2] pt-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B9590] mb-1">📄 Artifacts due</p>
                <p className="text-[11px] text-[#6B6560] leading-relaxed">{w.artifacts}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
