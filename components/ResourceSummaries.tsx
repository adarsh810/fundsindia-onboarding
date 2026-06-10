'use client';

import { useEffect, useState } from 'react';
import type { Resource } from '@/lib/types';
import type { Status } from '@/lib/types';

interface Summary {
  resource_url: string;
  resource_label: string;
  bullets: string[];
  generated_at: string;
}

function isYouTubeChannel(url: string): boolean {
  return /youtube\.com\/@|youtube\.com\/channel\/|youtube\.com\/user\/|youtube\.com\/playlist/.test(url);
}

function canSummarise(resource: Resource): { ok: boolean; reason?: string } {
  if (!resource.url) return { ok: false, reason: 'No URL — internal resource' };
  if (isYouTubeChannel(resource.url)) return { ok: false, reason: 'Channel link — needs a specific video URL' };
  return { ok: true };
}

export default function ResourceSummaries({
  topicId,
  resources,
  trackColor,
  currentStatus,
}: {
  topicId: string;
  resources: Resource[];
  trackColor: string;
  currentStatus: Status;
}) {
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loadingSummaries, setLoadingSummaries] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [resourceDone, setResourceDone] = useState<Record<string, boolean>>({});
  const [togglingDone, setTogglingDone] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null); // url being edited
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/summarise?topicId=${topicId}`).then(r => r.json()),
      fetch(`/api/resource-progress?topicId=${topicId}`).then(r => r.json()),
    ]).then(([summaryData, progressData]) => {
      const map: Record<string, Summary> = {};
      for (const s of summaryData.summaries ?? []) map[s.resource_url] = s;
      setSummaries(map);
      setResourceDone(progressData.progress ?? {});
    }).finally(() => setLoadingSummaries(false));
  }, [topicId]);

  async function toggleDone(resource: Resource) {
    const label = resource.label;
    const newDone = !resourceDone[label];
    setTogglingDone(label);
    setResourceDone(prev => ({ ...prev, [label]: newDone }));

    try {
      const res = await fetch('/api/resource-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          resourceLabel: label,
          done: newDone,
          totalResources: resources.length,
          currentTopicStatus: currentStatus,
        }),
      });
      const data = await res.json();
      if (data.newStatus) {
        window.dispatchEvent(new CustomEvent('topic-status-changed', {
          detail: { topicId, status: data.newStatus },
        }));
      }
    } finally {
      setTogglingDone(null);
    }
  }

  async function generate(resource: Resource) {
    if (!resource.url) return;
    setGenerating(resource.url);
    setErrors(prev => { const n = { ...prev }; delete n[resource.url!]; return n; });
    try {
      const res = await fetch('/api/summarise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, resourceUrl: resource.url, resourceLabel: resource.label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSummaries(prev => ({ ...prev, [resource.url!]: data.summary }));
    } catch (e: unknown) {
      setErrors(prev => ({ ...prev, [resource.url!]: e instanceof Error ? e.message : 'Error' }));
    } finally {
      setGenerating(null);
    }
  }

  async function saveEdit(url: string) {
    setSaving(true);
    const bullets = editText.split('\n').map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
    try {
      const res = await fetch('/api/summarise', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, resourceUrl: url, bullets }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      setSummaries(prev => ({ ...prev, [url]: data.summary }));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  if (loadingSummaries) return null;

  const summarisable = resources.filter(r => canSummarise(r).ok);
  const doneCount = summarisable.filter(r => summaries[r.url!]).length;
  const resourcesDoneCount = resources.filter(r => resourceDone[r.label]).length;

  return (
    <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">
            📚 Resources ({resources.length})
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {resourcesDoneCount > 0 && (
              <p className="text-[11px] text-[#9B9590]">{resourcesDoneCount}/{resources.length} done</p>
            )}
            {doneCount > 0 && (
              <p className="text-[11px] text-[#9B9590]">{doneCount}/{summarisable.length} summarised</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {resources.map((r, i) => {
          const { ok, reason } = canSummarise(r);
          const summary = r.url ? summaries[r.url] : undefined;
          const isGenerating = r.url ? generating === r.url : false;
          const err = r.url ? errors[r.url] : undefined;
          const isOpen = r.url ? open[r.url] : false;
          const isDone = resourceDone[r.label] ?? false;
          const isToggling = togglingDone === r.label;

          return (
            <div key={i} className={`border rounded-xl overflow-hidden transition-colors ${isDone ? 'border-[#D1EDDA]' : 'border-[#EEE9E2]'}`}>
              {/* Resource row */}
              <div className="flex items-center gap-3 px-4 py-2.5">
                {/* Done checkbox */}
                <button
                  onClick={() => toggleDone(r)}
                  disabled={isToggling}
                  className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all hover:brightness-90"
                  style={{
                    borderColor: isDone ? '#2D6A4F' : '#C8C2BA',
                    background: isDone ? '#2D6A4F' : 'transparent',
                  }}
                  title={isDone ? 'Mark undone' : 'Mark done'}
                >
                  {isDone && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className={`text-[12px] flex-1 min-w-0 truncate hover:underline underline-offset-2 transition-colors ${isDone ? 'line-through opacity-60' : ''}`}
                    style={{ color: trackColor }}>
                    {r.label}
                  </a>
                ) : (
                  <span className={`text-[12px] flex-1 min-w-0 truncate text-[#4A4540] ${isDone ? 'line-through opacity-60' : ''}`}>{r.label}</span>
                )}

                {/* Summarise action */}
                {!ok ? (
                  <span className="shrink-0 text-[10px] text-[#C8C2BA] italic" title={reason}>n/a</span>
                ) : isGenerating ? (
                  <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-medium" style={{ color: trackColor }}>
                    <span className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: `${trackColor} transparent transparent transparent` }} />
                    Reading…
                  </span>
                ) : summary ? (
                  <button
                    onClick={() => setOpen(prev => ({ ...prev, [r.url!]: !prev[r.url!] }))}
                    className="shrink-0 flex items-center gap-1 text-[10px] font-semibold transition-all hover:opacity-80"
                    style={{ color: trackColor }}
                  >
                    {isOpen ? '▲ Hide' : '▼ Notes'}
                    <span className="text-[10px] bg-[#D1EDDA] text-[#1B5E2A] px-1.5 py-0.5 rounded-full ml-1">
                      {summary.bullets.length}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => generate(r)}
                    className="shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:brightness-95"
                    style={{ borderColor: trackColor, color: trackColor }}
                  >
                    ✦ Summarise
                  </button>
                )}
              </div>

              {/* Error */}
              {err && (
                <div className="px-4 pb-2.5 flex items-center justify-between gap-2">
                  <p className="text-[11px] text-red-500">{err}</p>
                  <button onClick={() => generate(r)}
                    className="text-[10px] text-red-400 hover:text-red-600 underline shrink-0">Retry</button>
                </div>
              )}

              {/* Bullets */}
              {summary && isOpen && (
                <div className="border-t border-[#EEE9E2] px-4 py-3 bg-[#FAF8F5]">
                  {editing === r.url ? (
                    <>
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full text-[12px] text-[#3A3530] leading-relaxed bg-white border border-[#D8D3CC] rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:border-[#9B9590] transition-colors"
                        rows={Math.max(4, editText.split('\n').length + 1)}
                        placeholder="One note per line…"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => saveEdit(r.url!)}
                          disabled={saving}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-all hover:brightness-90 disabled:opacity-50"
                          style={{ background: trackColor }}
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <ul className="space-y-2">
                      {summary.bullets.map((b, bi) => (
                        <li key={bi} className="flex items-start gap-2.5 text-[12px] text-[#3A3530] leading-snug">
                          <span className="shrink-0 mt-0.5 text-[10px] font-bold" style={{ color: trackColor }}>
                            {bi + 1}.
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EEE9E2]">
                    <p className="text-[10px] text-[#C8C2BA]">
                      {new Date(summary.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {editing !== r.url && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => { setEditing(r.url!); setEditText(summary.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')); }}
                          className="text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-colors"
                        >
                          Edit
                        </button>
                        <button onClick={() => generate(r)}
                          className="text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-colors">
                          Re-generate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
