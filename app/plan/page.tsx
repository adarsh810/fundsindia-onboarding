import AppNav from '@/components/AppNav';
import PlanView from '@/components/PlanView';
import { getAllProgress, getAllScheduleOverrides, getAllMetaOverrides } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Props { searchParams: Promise<{ track?: string }> }

export default async function PlanPage({ searchParams }: Props) {
  const [progress, overrides, metas, { track }] = await Promise.all([
    getAllProgress(),
    getAllScheduleOverrides(),
    getAllMetaOverrides(),
    searchParams,
  ]);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-[28px] font-bold tracking-tight text-[#1C1C1A] mb-6">
          Learning plan
        </h1>
        <PlanView initialProgress={progress} initialTrack={track} overrides={overrides} metas={metas} />
      </div>
    </div>
  );
}
