import Link from 'next/link';
import AppNav from '@/components/AppNav';
import { ONBOARDING_TOPICS } from '@/lib/data';
import { getAllProgress } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const STATUS_DOT: Record<string, string> = {
  not_started: '#C8C2BA',
  in_progress: '#F4C97A',
  done: '#6DB07A',
};

export default async function OnboardingPlan() {
  const progress = await getAllProgress();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Onboarding KT
          </h1>
          <p className="text-sm text-[#6B6560]">Knowledge transfer topics for your first weeks at FundsIndia</p>
        </div>

        <div className="space-y-4">
          {ONBOARDING_TOPICS.map(l1 => {
            const hasTopics = l1.categories.some(c => c.topics.length > 0);
            return (
              <div key={l1.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
                {/* Track header */}
                <div className="px-5 py-4 flex items-center gap-3 border-b border-[#F0EDE8]">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: l1.color }} />
                  <h2 className="font-[family-name:var(--font-playfair)] text-[17px] font-bold text-[#1C1C1A] flex-1">
                    {l1.label}
                  </h2>
                  {hasTopics && (
                    <span className="text-[11px] text-[#9B9590]">
                      {l1.categories.flatMap(c => c.topics).filter(t => progress[t.id] === 'done').length}/
                      {l1.categories.flatMap(c => c.topics).length} done
                    </span>
                  )}
                </div>

                {!hasTopics ? (
                  <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1"
                      style={{ background: l1.accent }}>
                      <span className="text-[14px]">⏳</span>
                    </div>
                    <p className="text-[13px] font-medium text-[#4A4540]">Topics coming soon</p>
                    <p className="text-[11px] text-[#9B9590]">L2 topics for this track will be added as onboarding progresses.</p>
                  </div>
                ) : (
                  <div>
                    {l1.categories.map((cat, ci) => (
                      <div key={cat.name}>
                        <div className={`px-5 py-2.5 bg-[#F5F2EE] ${ci > 0 ? 'border-t border-[#EEE9E2]' : ''}`}>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B6560]">{cat.name}</p>
                        </div>
                        <div className="divide-y divide-[#F5F2EE]">
                          {cat.topics.map(t => {
                            const status = (progress[t.id] as string) ?? 'not_started';
                            return (
                              <Link
                                key={t.id}
                                href={`/topic/${t.id}`}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAF8F5] transition-colors group"
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_DOT[status] ?? STATUS_DOT.not_started }} />
                                <span
                                  className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono"
                                  style={{ background: l1.accent, color: l1.color }}
                                >
                                  {t.id}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-[#1C1C1A] group-hover:text-black truncate">{t.title}</p>
                                  <p className="text-[11px] text-[#9B9590] truncate mt-0.5 hidden sm:block">{t.desc}</p>
                                </div>
                                <span className="text-[11px] text-[#9B9590] shrink-0">{t.hours}h</span>
                                <svg className="w-3.5 h-3.5 text-[#D5CFC8] group-hover:text-[#9B9590] transition-colors shrink-0"
                                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
