'use client';

import { useEffect, useState } from 'react';
import type { GeneratedResource, ResourceBatch } from '@/lib/types';

const TYPE_ICON: Record<GeneratedResource['type'], string> = {
  video: '▶',
  article: '✦',
  doc: '◈',
  book: '◉',
  tool: '⚙',
};

export default function GeneratedResources({
  topicId,
  trackColor,
}: {
  topicId: string;
  trackColor: string;
}) {
  const [batches, setBatches] = useState<ResourceBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/resources?topicId=${topicId}`)
      .then(r => r.json())
      .then(d => setBatches(d.batches ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicId]);

  async function generate() {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      if (data.batch) setBatches(prev => [data.batch, ...prev]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return null;

  return (
    <div className="bg-white border border-[#E8E4DE] rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9B9590]">
          ✦ Claude-suggested resources
        </p>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all disabled:opacity-50"
          style={{ borderColor: trackColor, color: trackColor }}
        >
          {generating ? (
            <>
              <span
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: `${trackColor} transparent transparent transparent` }}
              />
              Generating…
            </>
          ) : (
            '+ Generate more'
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-red-500 mb-3">{error}</p>
      )}

      {batches.length === 0 && !generating ? (
        <p className="text-[12px] text-[#9B9590] text-center py-3">
          No generated resources yet — click "Generate more" to ask Claude for additional reading.
        </p>
      ) : (
        <div className="space-y-4">
          {batches.map((batch, bi) => (
            <div key={batch.id}>
              {bi > 0 && <div className="border-t border-[#EEE9E2] pt-3 -mb-1" />}
              <p className="text-[10px] text-[#C8C2BA] mb-2">
                Batch {batches.length - bi} ·{' '}
                {new Date(batch.generated_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <div className="divide-y divide-[#EEE9E2]">
                {(batch.resources as GeneratedResource[]).map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <span className="shrink-0 mt-0.5 text-[11px] font-bold" style={{ color: trackColor }}>
                      {TYPE_ICON[r.type] ?? '→'}
                    </span>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] leading-snug hover:underline underline-offset-2 transition-colors"
                      style={{ color: trackColor }}
                    >
                      {r.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
