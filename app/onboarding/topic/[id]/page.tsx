import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import StatusToggle from '@/components/StatusToggle';
import TopicChat from '@/components/TopicChat';
import ArtifactReviewer from '@/components/ArtifactReviewer';
import ResourcesPanel from '@/components/ResourcesPanel';
import TopicSidebar from '@/components/TopicSidebar';
import EditableTopicHeader from '@/components/EditableTopicHeader';
import { getAllProgress, getAllScheduleOverrides, getAllMetaOverrides, getAllL1Overrides, getCustomTopicById, getCustomTopics, getHiddenTopics } from '@/lib/supabase';
import { findTopicById, findTrackForTopic, TOPICS, ONBOARDING_TOPICS, resolveMeta } from '@/lib/data';
import { getEffectivePositions, formatEffectiveWeekLabel } from '@/lib/schedule';
import type { Status } from '@/lib/types';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const topic = findTopicById(id);
  if (topic) {
    const metas = await getAllMetaOverrides();
    return { title: `${resolveMeta(topic, metas).title} — FI Prep` };
  }
  const custom = await getCustomTopicById(id);
  return { title: custom ? `${custom.title} — FI Prep` : 'Topic not found' };
}

export default async function OnboardingTopicPage({ params }: Props) {
  const { id } = await params;

  const staticTopic = findTopicById(id);
  const customTopic = staticTopic ? null : await getCustomTopicById(id);
  if (!staticTopic && !customTopic) notFound();

  const isCustom = !staticTopic;
  const topicTitle    = staticTopic?.title    ?? customTopic!.title;
  const topicDesc     = staticTopic?.desc     ?? customTopic!.desc;
  const topicHours    = staticTopic?.hours    ?? customTopic!.hours;
  const topicDone     = staticTopic?.done     ?? '';
  const topicArtifact = staticTopic?.artifact ?? '';
  const topicResources = staticTopic?.resources ?? [];

  const track = findTrackForTopic(id)
    ?? [...TOPICS, ...ONBOARDING_TOPICS].find(l => l.id === customTopic?.l1Id)
    ?? ONBOARDING_TOPICS[0];

  const [progress, overrides, metas, l1Overrides, sidebarCustomTopics, hiddenSet] = await Promise.all([
    getAllProgress(),
    getAllScheduleOverrides(),
    getAllMetaOverrides(),
    getAllL1Overrides('onboarding'),
    getCustomTopics('onboarding'),
    getHiddenTopics(),
  ]);

  const resolvedTrackLabel = l1Overrides[track.id]?.label || track.label;

  const status: Status = (progress[id] as Status) ?? 'not_started';
  const effectiveWeek  = staticTopic ? formatEffectiveWeekLabel(getEffectivePositions(staticTopic, overrides)) : '';
  const effectiveTitle = staticTopic ? resolveMeta(staticTopic, metas).title : topicTitle;
  const effectiveDesc  = staticTopic ? resolveMeta(staticTopic, metas).desc  : topicDesc;

  const backHref = `/onboarding/plan?track=${isCustom ? customTopic!.l1Id : track.id}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start">

        <div className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#9B9590] mb-5">
            <Link href={backHref} className="hover:text-[#1C1C1A] transition-colors">Topics</Link>
            <svg className="w-3 h-3 text-[#C8C2BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span style={{ color: track.color }}>{resolvedTrackLabel}</span>
            <svg className="w-3 h-3 text-[#C8C2BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            <span className="text-[#6B6560]">{isCustom ? effectiveTitle : id}</span>
          </div>

          {/* Header */}
          <div className="bg-white border border-[#E8E4DE] rounded-2xl overflow-hidden mb-4">
            <div className="h-1 w-full" style={{ background: track.color }} />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                {!isCustom && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: track.accent, color: track.color }}>{id}</span>
                )}
                {effectiveWeek && <span className="text-[11px] text-[#9B9590]">{effectiveWeek} · </span>}
                <span className="text-[11px] text-[#9B9590]">{topicHours}h</span>
                <span className="text-[11px] text-[#9B9590]">·</span>
                <span className="text-[11px]" style={{ color: track.color }}>{resolvedTrackLabel}</span>
              </div>
              <EditableTopicHeader
                topicId={id}
                initialTitle={effectiveTitle}
                initialDesc={effectiveDesc}
                baseTitle={topicTitle}
                baseDesc={topicDesc}
                trackColor={track.color}
              />
              <StatusToggle topicId={id} initial={status} color={track.color} />
            </div>
          </div>

          {topicDone && (
            <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">✓ Done when you can</p>
              <p className="text-sm text-[#3A3530] leading-relaxed border-l-[3px] pl-4" style={{ borderColor: track.color }}>{topicDone}</p>
            </div>
          )}

          <ResourcesPanel topicId={id} defaultResources={topicResources} trackColor={track.color} currentStatus={status} />

          {topicArtifact && (
            <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">📄 Artifact to produce</p>
              <p className="text-sm text-[#3A3530] leading-relaxed bg-[#F5F2EE] rounded-xl px-4 py-3">{topicArtifact}</p>
            </div>
          )}

          <div className="space-y-3 mb-8">
            <TopicChat topicId={id} />
            {topicArtifact && <ArtifactReviewer topicId={id} artifactDesc={topicArtifact} />}
          </div>

        </div>

        <TopicSidebar track={track} trackLabel={resolvedTrackLabel} currentId={id} progress={progress} metas={metas}
          customTopics={sidebarCustomTopics} hiddenTopics={[...hiddenSet]} />

      </div>
    </div>
  );
}
