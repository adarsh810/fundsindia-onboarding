'use client';

import { useEffect, useState } from 'react';
import type { Resource } from '@/lib/types';

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
}: {
  topicId: string;
  resources: Resource[];
  trackColor: string;
}) {
  const [summaries, setSummaries] = useState<Record<string, Summary>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null); // url being generated
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/summarise?topicId=${topicId}`)
      .then(r => r.json())
      .then(d => {
        const map: Record<string, Summary> = {};
        for (const s of d.summaries ?? []) map[s.resource_url] = s;
        setSummaries(map);
        // auto-open first summarised resource
        const first = Object.keys(map)[0];
        if (first) setOpen({ [first]: true });
      })
      .finally(() => setLoading(false));
  }, [topicId]);

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
      setOpen(prev => ({ ...prev, [resource.url!]: true }));
    } catch (e: unknown) {
      setErrors(prev => ({ ...prev, [resource.url!]: e instanceof Error ? e.message : 'Error' }));
    } finally {
      setGenerating(null);
    }
  }

  if (loading) return null;

  const summarisable = resources.filter(r => canSummarise(r).ok);
  const doneCount = summarisable.filter(r => summaries[r.url!]).length;

  return (
    <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">
            📚 Resources ({resources.length})
          </p>
          {doneCount > 0 && (
            <p className="text-[11px] text-[#9B9590] mt-0.5">{doneCount}/{summarisable.length} summarised</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {resources.map((r, i) => {
          const { ok, reason } = canSummarise(r);
          const summary = r.url ? summaries[r.url] : undefined;
          const isGenerating = r.url ? generating === r.url : false;
          const err = r.url ? errors[r.url] : undefined;
          const isOpen = r.url ? open[r.url] : false;

          return (
            <div key={i} className="border border-[#EEE9E2] rounded-xl overflow-hidden">
              {/* Resource row */}
              <div className="flex items-center gap-3 px-4 py-2.5">
                <span className="shrink-0 text-[11px] font-bold" style={{ color: trackColor }}>→</span>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] flex-1 min-w-0 truncate hover:underline underline-offset-2 transition-colors"
                    style={{ color: trackColor }}>
                    {r.label}
                  </a>
                ) : (
                  <span className="text-[12px] flex-1 min-w-0 truncate text-[#4A4540]">{r.label}</span>
                )}

                {/* Action */}
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
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EEE9E2]">
                    <p className="text-[10px] text-[#C8C2BA]">
                      {new Date(summary.generated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <button onClick={() => generate(r)}
                      className="text-[10px] text-[#9B9590] hover:text-[#4A4540] transition-colors">
                      Re-generate
                    </button>
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
