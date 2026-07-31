import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import StatusToggle from '@/components/StatusToggle';
import TopicChat from '@/components/TopicChat';
import ArtifactReviewer from '@/components/ArtifactReviewer';
import ResourcesPanel from '@/components/ResourcesPanel';
import TopicSidebar from '@/components/TopicSidebar';
import EditableTopicHeader from '@/components/EditableTopicHeader';
import { getAllProgress, getAllScheduleOverrides, getAllMetaOverrides } from '@/lib/supabase';
import { findTopicById, findTrackForTopic, ALL_TOPICS, resolveMeta } from '@/lib/data';
import { getEffectivePositions, formatEffectiveWeekLabel } from '@/lib/schedule';
import type { Status } from '@/lib/types';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const topic = findTopicById(id);
  if (!topic) return { title: 'Topic not found' };
  const metas = await getAllMetaOverrides();
  const { title } = resolveMeta(topic, metas);
  return { title: `${title} — FI Prep` };
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params;
  const topic = findTopicById(id);
  if (!topic) notFound();

  const track = findTrackForTopic(id)!;
  const [progress, overrides, metas] = await Promise.all([
    getAllProgress(),
    getAllScheduleOverrides(),
    getAllMetaOverrides(),
  ]);
  const status: Status = (progress[id] as Status) ?? 'not_started';
  const effectiveWeek = formatEffectiveWeekLabel(getEffectivePositions(topic, overrides));
  const { title: effectiveTitle, desc: effectiveDesc } = resolveMeta(topic, metas);

  // prev/next topic in flat order
  const allIds = ALL_TOPICS.map(t => t.id);
  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;
  const prevTopic = prevId ? findTopicById(prevId) : null;
  const nextTopic = nextId ? findTopicById(nextId) : null;
  const prevTitle = prevTopic ? resolveMeta(prevTopic, metas).title : '';
  const nextTitle = nextTopic ? resolveMeta(nextTopic, metas).title : '';

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#9B9590] mb-5">
          <Link href={`/plan?track=${track.id}`} className="hover:text-[#1C1C1A] transition-colors">Topics</Link>
          <svg className="w-3 h-3 text-[#C8C2BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: track.color }}>{track.label}</span>
          <svg className="w-3 h-3 text-[#C8C2BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-[#6B6560]">{topic.id}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden mb-4">
          <div className="h-1 w-full" style={{ background: track.color }} />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: track.accent, color: track.color }}>{topic.id}</span>
              <span className="text-[11px] text-[#9B9590]">{effectiveWeek} · {topic.hours}h</span>
              <span className="text-[11px] text-[#9B9590]">·</span>
              <span className="text-[11px]" style={{ color: track.color }}>{track.label}</span>
            </div>
            <EditableTopicHeader
              topicId={topic.id}
              initialTitle={effectiveTitle}
              initialDesc={effectiveDesc}
              baseTitle={topic.title}
              baseDesc={topic.desc}
              trackColor={track.color}
            />
            <StatusToggle topicId={topic.id} initial={status} color={track.color} />
          </div>
        </div>

        {/* Done when */}
        <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">✓ Done when you can</p>
          <p className="text-sm text-[#3A3530] leading-relaxed border-l-[3px] pl-4" style={{ borderColor: track.color }}>{topic.done}</p>
        </div>

        {/* Resources panel — primary + additional, drag-and-drop */}
        <ResourcesPanel topicId={topic.id} defaultResources={topic.resources} trackColor={track.color} currentStatus={status} />

        {/* Artifact */}
        <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">📄 Artifact to produce</p>
          <p className="text-sm text-[#3A3530] leading-relaxed bg-[#F5F2EE] rounded-xl px-4 py-3">{topic.artifact}</p>
        </div>

        {/* Claude features */}
        <div className="space-y-3 mb-8">
          <TopicChat topicId={topic.id} />
          <ArtifactReviewer topicId={topic.id} artifactDesc={topic.artifact} />
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between gap-3">
          {prevId ? (
            <Link href={`/topic/${prevId}`} className="flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#1C1C1A] bg-white border border-[#E8E4DE] rounded-xl px-3.5 py-2.5 hover:border-[#C8C2BA] transition-all max-w-[48%]">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span className="truncate">{prevTitle}</span>
            </Link>
          ) : <div />}
          {nextId ? (
            <Link href={`/topic/${nextId}`} className="flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#1C1C1A] bg-white border border-[#E8E4DE] rounded-xl px-3.5 py-2.5 hover:border-[#C8C2BA] transition-all max-w-[48%] ml-auto">
              <span className="truncate">{nextTitle}</span>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : <div />}
        </div>

        </div>{/* end main content */}

        <TopicSidebar track={track} currentId={id} progress={progress} metas={metas} />

      </div>
    </div>
  );
}
