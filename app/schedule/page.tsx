import AppNav from '@/components/AppNav';
import ScheduleView from '@/components/ScheduleView';
import { getAllProgress, getAllScheduleOverrides, getAllMetaOverrides, getHiddenTopics } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const [progress, overrides, metas, hiddenSet] = await Promise.all([
    getAllProgress(),
    getAllScheduleOverrides(),
    getAllMetaOverrides(),
    getHiddenTopics(),
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-1">
            Weekly schedule
          </h1>
          <p className="text-sm text-[#6B6560]">
            Drag pills between collapsed weeks to reshuffle · click a week to see the Gantt
          </p>
        </div>
        <ScheduleView progress={progress} initialOverrides={overrides} metas={metas} hiddenTopics={[...hiddenSet]} />
      </div>
    </div>
  );
}
