import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import StatusToggle from '@/components/StatusToggle';
import TopicChat from '@/components/TopicChat';
import ArtifactReviewer from '@/components/ArtifactReviewer';
import ResourcesPanel from '@/components/ResourcesPanel';
import { getAllProgress } from '@/lib/supabase';
import { findTopicById, findTrackForTopic, ALL_TOPICS } from '@/lib/data';
import type { Status } from '@/lib/types';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const topic = findTopicById(id);
  if (!topic) return { title: 'Topic not found' };
  return { title: `${topic.title} — FI Prep` };
}

export default async function TopicPage({ params }: Props) {
  const { id } = await params;
  const topic = findTopicById(id);
  if (!topic) notFound();

  const track = findTrackForTopic(id)!;
  const progress = await getAllProgress();
  const status: Status = (progress[id] as Status) ?? 'not_started';

  // prev/next topic in flat order
  const allIds = ALL_TOPICS.map(t => t.id);
  const idx = allIds.indexOf(id);
  const prevId = idx > 0 ? allIds[idx - 1] : null;
  const nextId = idx < allIds.length - 1 ? allIds[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <AppNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start">

        {/* Main content */}
        <div className="flex-1 min-w-0">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#9B9590] mb-5">
          <Link href={`/plan?track=${track.id}`} className="hover:text-[#1C1C1A] transition-colors">Topics</Link>
          <span>/</span>
          <span style={{ color: track.color }}>{track.label}</span>
          <span>/</span>
          <span className="text-[#6B6560]">{topic.id}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 sm:p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: track.accent, color: track.color }}>{topic.id}</span>
            <span className="text-[11px] text-[#9B9590]">{topic.week} · {topic.hours}h</span>
            <span className="text-[11px] text-[#9B9590]">·</span>
            <span className="text-[11px]" style={{ color: track.color }}>{track.label}</span>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-[22px] sm:text-[26px] font-bold text-[#1C1C1A] mb-1.5 leading-snug">{topic.title}</h1>
          <p className="text-sm text-[#6B6560] mb-5">{topic.desc}</p>
          <StatusToggle topicId={topic.id} initial={status} color={track.color} />
        </div>

        {/* Done when */}
        <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590] mb-3">✓ Done when you can</p>
          <p className="text-sm text-[#3A3530] leading-relaxed border-l-2 pl-4" style={{ borderColor: track.color }}>{topic.done}</p>
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
            <Link href={`/topic/${prevId}`} className="flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#1C1C1A] transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              {findTopicById(prevId)?.title}
            </Link>
          ) : <div />}
          {nextId ? (
            <Link href={`/topic/${nextId}`} className="flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#1C1C1A] transition-colors">
              {findTopicById(nextId)?.title}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          ) : <div />}
        </div>

        </div>{/* end main content */}

        {/* Track sidebar */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-[4.5rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: track.color }}>{track.label}</p>
            <div className="space-y-4">
              {track.categories.map(cat => (
                <div key={cat.name}>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#C8C2BA] mb-1">{cat.name}</p>
                  <div className="space-y-0.5">
                    {cat.topics.map(t => {
                      const isCurrent = t.id === id;
                      const tStatus = (progress[t.id] as Status) ?? 'not_started';
                      return (
                        <Link key={t.id} href={`/topic/${t.id}`}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group"
                          style={isCurrent ? { background: track.accent } : {}}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors" style={{
                            background: tStatus === 'done' ? track.color : tStatus === 'in_progress' ? '#F4C97A' : '#D5CFC8',
                          }} />
                          <span className="font-mono text-[9px] shrink-0" style={{ color: isCurrent ? track.color : '#9B9590' }}>{t.id}</span>
                          <span className={`text-[11px] truncate transition-colors ${isCurrent ? 'font-semibold' : 'text-[#6B6560] group-hover:text-[#1C1C1A]'}`}
                            style={isCurrent ? { color: track.color } : {}}
                          >{t.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
