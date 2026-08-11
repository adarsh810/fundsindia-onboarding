import Link from 'next/link';
import AppNav from '@/components/AppNav';
import { ONBOARDING_TOPICS, resolveMeta } from '@/lib/data';
import { getAllProgress, getAllMetaOverrides, getAllL1Overrides, getCustomTopics, getHiddenTopics, getCustomL1Tracks, getResourceDoneCount } from '@/lib/supabase';
import type { CustomL1Track } from '@/lib/supabase';
import OverallProgress from '@/components/OverallProgress';

export const dynamic = 'force-dynamic';

export default async function OnboardingDashboard() {
  const [progress, metas, l1Overrides, customTopics, hiddenSet, customL1Tracks] = await Promise.all([
    getAllProgress(),
    getAllMetaOverrides(),
    getAllL1Overrides('onboarding'),
    getCustomTopics('onboarding'),
    getHiddenTopics(),
    getCustomL1Tracks('onboarding'),
  ]);

  // Flat merged topic list: static (minus hidden) + custom, with per-track serial numbers
  type FlatTopic = { id: string; title: string; hours: number; l1Id: string; l1Label: string; l1Color: string; serial: string };

  const validL1Ids = new Set([
    ...ONBOARDING_TOPICS.map(l => l.id),
    ...customL1Tracks.map(l => l.id),
  ]);

  const allTopics: FlatTopic[] = [];

  // Static L1 tracks (from ONBOARDING_TOPICS)
  for (const l1 of ONBOARDING_TOPICS) {
    let pos = 0;
    for (const cat of l1.categories) {
      for (const t of cat.topics) {
        if (!hiddenSet.has(t.id)) {
          pos++;
          allTopics.push({ id: t.id, title: resolveMeta(t, metas).title, hours: t.hours, l1Id: l1.id, l1Label: l1Overrides[l1.id]?.label || l1.label, l1Color: l1.color, serial: String(pos) });
        }
      }
    }
    for (const ct of customTopics.filter(c => c.l1Id === l1.id && validL1Ids.has(c.l1Id))) {
      pos++;
      allTopics.push({ id: ct.id, title: metas[ct.id]?.title?.trim() || ct.title, hours: ct.hours, l1Id: l1.id, l1Label: l1Overrides[l1.id]?.label || l1.label, l1Color: l1.color, serial: String(pos) });
    }
  }

  // Custom L1 tracks created by the user — also need their topics in allTopics
  for (const cl1 of customL1Tracks) {
    let pos = 0;
    for (const ct of customTopics.filter(c => c.l1Id === cl1.id)) {
      pos++;
      allTopics.push({ id: ct.id, title: metas[ct.id]?.title?.trim() || ct.title, hours: ct.hours, l1Id: cl1.id, l1Label: l1Overrides[cl1.id]?.label || cl1.label, l1Color: cl1.color, serial: String(pos) });
    }
  }

  const doneCount   = allTopics.filter(t => progress[t.id] === 'done').length;
  const activeCount = allTopics.filter(t => progress[t.id] === 'in_progress').length;
  const doneHours   = allTopics.filter(t => progress[t.id] === 'done').reduce((a, t) => a + t.hours, 0);
  const totalHours  = allTopics.reduce((a, t) => a + t.hours, 0);

  // Resource-level completion: use static topic resources (custom topics have 0)
  const staticTopicIds = ONBOARDING_TOPICS.flatMap(l1 =>
    l1.categories.flatMap(c => c.topics.filter(t => !hiddenSet.has(t.id)).map(t => t.id))
  );
  const totalResources = ONBOARDING_TOPICS.flatMap(l1 =>
    l1.categories.flatMap(c => c.topics.filter(t => !hiddenSet.has(t.id)))
  ).reduce((sum, t) => sum + t.resources.length, 0);
  const resourceDone = await getResourceDoneCount(staticTopicIds);

  const nextTopics = [
    ...allTopics.filter(t => progress[t.id] === 'in_progress'),
    ...allTopics.filter(t => (progress[t.id] ?? 'not_started') === 'not_started'),
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[30px] sm:text-[36px] font-bold tracking-tight text-[#1C1C1A] mb-1.5">
            Core FundsIndia
          </h1>
          <p className="text-sm text-[#6B6560]">Deep knowledge transfer on flows, architecture, and strategy</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Topics done',   value: doneCount,   suffix: `/${allTopics.length}`, color: '#6DB07A' },
            { label: 'In progress',   value: activeCount, suffix: ' topics',              color: '#E6A020' },
            { label: 'Hours covered', value: doneHours,   suffix: `/${totalHours}h`,      color: '#7B68C8' },
          ].map(m => (
            <div key={m.label} className="bg-white border border-[#E8E4DE] rounded-xl p-4 sm:p-5"
              style={{ borderTop: `3px solid ${m.color}` }}>
              <p className="text-[10px] text-[#9B9590] uppercase tracking-[0.08em] mb-2">{m.label}</p>
              <p className="font-[family-name:var(--font-playfair)] text-[26px] sm:text-[30px] font-bold leading-none"
                style={{ color: m.color }}>
                {m.value}<span className="text-sm font-normal text-[#9B9590] font-[family-name:var(--font-dm)]">{m.suffix}</span>
              </p>
            </div>
          ))}
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-4 sm:p-5" style={{ borderTop: '3px solid #4B9E85' }}>
            <OverallProgress
              topicDone={doneCount} topicTotal={allTopics.length}
              resourceDone={resourceDone} resourceTotal={totalResources}
              color="#4B9E85"
            />
          </div>
        </div>

        {/* Track progress */}
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold mb-5">Progress by track</h2>
          <div className="space-y-5">
            {/* Static L1 tracks that have topics */}
            {ONBOARDING_TOPICS
              .filter(l1 => allTopics.some(t => t.l1Id === l1.id))
              .map(l1 => {
                const l1Topics = allTopics.filter(t => t.l1Id === l1.id);
                const done   = l1Topics.filter(t => progress[t.id] === 'done').length;
                const active = l1Topics.filter(t => progress[t.id] === 'in_progress').length;
                const pctDone = Math.round((done / l1Topics.length) * 100);
                return (
                  <Link key={l1.id} href={`/onboarding/plan?track=${l1.id}`} className="block group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l1.color }} />
                        <span className="text-sm font-medium text-[#1C1C1A] group-hover:underline">{l1Overrides[l1.id]?.label || l1.label}</span>
                        {active > 0 && (
                          <span className="text-[10px] font-medium text-[#7A5010] bg-[#FEF0C7] px-2 py-0.5 rounded-full">{active} active</span>
                        )}
                      </div>
                      <span className="text-xs text-[#9B9590]">{done}/{l1Topics.length}</span>
                    </div>
                    <div className="h-1.5 bg-[#E8E4DE] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: l1.color }} />
                    </div>
                  </Link>
                );
              })}

            {/* Custom L1 tracks — always shown even with 0 topics */}
            {customL1Tracks.map(l1 => {
              const l1Topics = allTopics.filter(t => t.l1Id === l1.id);
              const done   = l1Topics.filter(t => progress[t.id] === 'done').length;
              const active = l1Topics.filter(t => progress[t.id] === 'in_progress').length;
              const pctDone = l1Topics.length ? Math.round((done / l1Topics.length) * 100) : 0;
              return (
                <Link key={l1.id} href={`/onboarding/plan?track=${l1.id}`} className="block group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: l1.color }} />
                      <span className="text-sm font-medium text-[#1C1C1A] group-hover:underline">{l1Overrides[l1.id]?.label || l1.label}</span>
                      {active > 0 && (
                        <span className="text-[10px] font-medium text-[#7A5010] bg-[#FEF0C7] px-2 py-0.5 rounded-full">{active} active</span>
                      )}
                      {l1Topics.length === 0 && (
                        <span className="text-[10px] text-[#9B9590] bg-[#F0EDE8] px-2 py-0.5 rounded-full">No topics yet</span>
                      )}
                    </div>
                    <span className="text-xs text-[#9B9590]">{done}/{l1Topics.length}</span>
                  </div>
                  <div className="h-1.5 bg-[#E8E4DE] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctDone}%`, background: l1.color }} />
                  </div>
                </Link>
              );
            })}

            {!ONBOARDING_TOPICS.some(l1 => allTopics.some(t => t.l1Id === l1.id)) && customL1Tracks.length === 0 && (
              <p className="text-[13px] text-[#9B9590] py-2">No topics added yet — go to Topics to add some.</p>
            )}
          </div>
        </div>

        {/* What to do now */}
        <div className="bg-[#1C1C1A] rounded-xl p-5 sm:p-6 text-[#FAF8F5]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-[family-name:var(--font-playfair)] text-[18px] font-semibold">What to do now</h2>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: '#6B3FA0', color: '#D7BDE2' }}>Core FundsIndia</span>
          </div>
          <p className="text-xs text-[#FAF8F5]/50 mb-5">Next topics from your onboarding plan</p>
          {nextTopics.length === 0 ? (
            <p className="text-[13px] text-[#FAF8F5]/60 py-4 text-center">All caught up!</p>
          ) : (
            <div className="divide-y divide-[#2D2D2A]">
              {nextTopics.map(t => (
                <Link key={t.id} href={`/onboarding/topic/${t.id}`} className="flex items-center gap-3 py-3.5 group">
                  <div className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ background: t.l1Color }}>
                    {t.serial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:underline">{t.title}</p>
                    <p className="text-[11px] text-[#FAF8F5]/40 mt-0.5">{t.hours}h · {t.l1Label}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#4A4540] group-hover:text-[#FAF8F5] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
