import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import StatusToggle from '@/components/StatusToggle';
import TopicChat from '@/components/TopicChat';
import ArtifactReviewer from '@/components/ArtifactReviewer';
import ResourcesPanel from '@/components/ResourcesPanel';
import TopicSidebar from '@/components/TopicSidebar';
import EditableTopicHeader from '@/components/EditableTopicHeader';
import { getAllProgress, getAllScheduleOverrides, getAllMetaOverrides, getCustomTopicById, getCustomTopics, getHiddenTopics } from '@/lib/supabase';
import type { CustomTopic } from '@/lib/supabase';
import { findTopicById, findTrackForTopic, TOPICS, ONBOARDING_TOPICS, ALL_TOPICS, resolveMeta } from '@/lib/data';
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
  return { title: `${title} — Gyaan` };
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params;

  // Try static topic first, then fall back to custom (user-added) topic
  const staticTopic = findTopicById(id);
  const customTopic = staticTopic ? null : await getCustomTopicById(id);
  if (!staticTopic && !customTopic) notFound();

  // Onboarding topics belong at /onboarding/topic/[id] — redirect there
  const isOnboardingTopic = staticTopic
    ? ONBOARDING_TOPICS.some(l => l.categories.some(c => c.topics.some(t => t.id === id)))
    : !!customTopic;
  if (isOnboardingTopic) redirect(`/onboarding/topic/${id}`);

  // Unified shape for rendering
  const isCustom = !staticTopic;
  const topicTitle  = staticTopic?.title  ?? customTopic!.title;
  const topicDesc   = staticTopic?.desc   ?? customTopic!.desc;
  const topicHours  = staticTopic?.hours  ?? customTopic!.hours;
  const topicDone   = staticTopic?.done   ?? '';
  const topicArtifact = staticTopic?.artifact ?? '';
  const topicResources = staticTopic?.resources ?? [];

  // Find the L1 track
  const track = findTrackForTopic(id)
    ?? [...TOPICS, ...ONBOARDING_TOPICS].find(l => l.id === customTopic?.l1Id)
    ?? TOPICS[0];

  // Determine which section this track belongs to for sidebar data
  const isOnboardingTrack = ONBOARDING_TOPICS.some(l => l.id === track.id);
  const section = isOnboardingTrack ? 'onboarding' : 'prejoining';

  const [progress, overrides, metas, sidebarCustomTopics, hiddenSet] = await Promise.all([
    getAllProgress(),
    getAllScheduleOverrides(),
    getAllMetaOverrides(),
    getCustomTopics(section),
    getHiddenTopics(),
  ]);
  const status: Status = (progress[id] as Status) ?? 'not_started';

  const effectiveWeek = staticTopic ? formatEffectiveWeekLabel(getEffectivePositions(staticTopic, overrides)) : '';
  const effectiveTitle = staticTopic ? resolveMeta(staticTopic, metas).title : topicTitle;
  const effectiveDesc  = staticTopic ? resolveMeta(staticTopic, metas).desc  : topicDesc;

  // prev/next only for static topics
  const allIds = ALL_TOPICS.map(t => t.id);
  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;
  const prevTopic = prevId ? findTopicById(prevId) : null;
  const nextTopic = nextId ? findTopicById(nextId) : null;
  const prevTitle = prevTopic ? resolveMeta(prevTopic, metas).title : '';
  const nextTitle = nextTopic ? resolveMeta(nextTopic, metas).title : '';

  // Back link — onboarding custom topics go back to onboarding plan
  const backHref = isCustom
    ? `/onboarding/plan?track=${customTopic!.l1Id}`
    : `/plan?track=${track.id}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#9B9590] mb-5">
          <Link href={backHref} className="hover:text-[#1C1C1A] transition-colors">Topics</Link>
          <svg className="w-3 h-3 text-[#C8C2BA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span style={{ color: track.color }}>{track.label}</span>
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
              <span className="text-[11px]" style={{ color: track.color }}>{track.label}</span>
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

        {/* Done when — only if non-empty */}
        {topicDone && (
          <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">✓ Done when you can</p>
            <p className="text-sm text-[#3A3530] leading-relaxed border-l-[3px] pl-4" style={{ borderColor: track.color }}>{topicDone}</p>
          </div>
        )}

        {/* Resources panel */}
        <ResourcesPanel topicId={id} defaultResources={topicResources} trackColor={track.color} currentStatus={status} />

        {/* Artifact — only if non-empty */}
        {topicArtifact && (
          <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">📄 Artifact to produce</p>
            <p className="text-sm text-[#3A3530] leading-relaxed bg-[#F5F2EE] rounded-xl px-4 py-3">{topicArtifact}</p>
          </div>
        )}

        {/* Claude features */}
        <div className="space-y-3 mb-8">
          <TopicChat topicId={id} />
          {topicArtifact && <ArtifactReviewer topicId={id} artifactDesc={topicArtifact} />}
        </div>

        {/* Prev / Next — only for static topics */}
        {!isCustom && (
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
        )}

        </div>{/* end main content */}

        <TopicSidebar track={track} currentId={id} progress={progress} metas={metas}
          customTopics={sidebarCustomTopics} hiddenTopics={[...hiddenSet]} />

      </div>
    </div>
  );
}
