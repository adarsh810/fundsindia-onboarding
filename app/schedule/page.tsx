import AppNav from '@/components/AppNav';
import ScheduleView from '@/components/ScheduleView';
import { getAllProgress } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const progress = await getAllProgress();

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-1">
            Weekly schedule
          </h1>
          <p className="text-sm text-[#6B6560]">
            10 hrs weekdays · 6 hrs weekends · 16 hrs/week · click a week to see the Gantt
          </p>
        </div>
        <ScheduleView progress={progress} />
      </div>
    </div>
  );
}
