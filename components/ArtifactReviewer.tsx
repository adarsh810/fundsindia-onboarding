'use client';

import { useState } from 'react';

interface ReviewResult {
  verdict: 'strong' | 'solid' | 'needs_work';
  score: number;
  what_works: string[];
  gaps: string[];
  one_thing_to_add: string;
  ready_to_move_on: boolean;
}

const VERDICT_CONFIG = {
  strong:     { label: 'Strong',      bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800' },
  solid:      { label: 'Solid',       bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-800' },
  needs_work: { label: 'Needs work',  bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-800' },
};

export default function ArtifactReviewer({ topicId, artifactDesc }: { topicId: string; artifactDesc: string }) {
  const [open, setOpen]         = useState(false);
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ReviewResult | null>(null);
  const [error, setError]       = useState('');

  async function review() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    const res = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId, artifact: text }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); setLoading(false); return; }
    setResult(data as ReviewResult);
    setLoading(false);
  }

  const vc = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div className="border border-[#E8E4DE] rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-[#FAF8F5] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📋</span>
          <span className="text-sm font-semibold text-[#1C1C1A]">Review my artifact</span>
          {result && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vc?.bg} ${vc?.text}`}>
              {vc?.label} · {result.score}/10
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-[#9B9590] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-[#E8E4DE] bg-white px-5 pb-5 pt-4 space-y-4">
          <p className="text-xs text-[#6B6560] leading-relaxed">
            <span className="font-semibold text-[#4A4540]">Expected: </span>{artifactDesc}
          </p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your artifact here — notes, diagrams described in words, bullet points, frameworks, anything you produced…"
            rows={6}
            className="w-full text-sm px-4 py-3 rounded-xl border border-[#E8E4DE] bg-[#FAF8F5] text-[#1C1C1A] placeholder-[#9B9590] resize-none focus:outline-none focus:ring-2 focus:ring-[#E8E4DE] transition"
          />

          <button
            type="button"
            onClick={review}
            disabled={!text.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1C1C1A] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#333] active:scale-[0.98] transition-all"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Reviewing…
              </>
            ) : 'Review artifact'}
          </button>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">❌ {error}</p>}

          {result && vc && (
            <div className="space-y-3">
              {/* Score bar */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${vc.bg} ${vc.border}`}>
                <span className={`text-sm font-semibold ${vc.text}`}>{vc.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${vc.text.replace('text-', 'bg-')}`} style={{ width: `${result.score * 10}%` }} />
                  </div>
                  <span className={`text-sm font-bold ${vc.text}`}>{result.score}/10</span>
                </div>
              </div>

              {/* What works */}
              {result.what_works.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#9B9590] uppercase tracking-wider mb-2">What works</p>
                  <ul className="space-y-1">
                    {result.what_works.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#1C1C1A]">
                        <span className="text-green-600 shrink-0 mt-0.5">✓</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gaps */}
              {result.gaps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[#9B9590] uppercase tracking-wider mb-2">Gaps</p>
                  <ul className="space-y-1">
                    {result.gaps.map((g, i) => (
                      <li key={i} className="flex gap-2 text-sm text-[#1C1C1A]">
                        <span className="text-amber-500 shrink-0 mt-0.5">△</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* One thing to add */}
              <div className="bg-[#F5F2EE] rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-[#9B9590] uppercase tracking-wider mb-1">One thing to add</p>
                <p className="text-sm text-[#1C1C1A]">{result.one_thing_to_add}</p>
              </div>

              {/* Ready to move on */}
              <div className={`flex items-center gap-2 text-sm font-medium ${result.ready_to_move_on ? 'text-green-700' : 'text-amber-700'}`}>
                {result.ready_to_move_on
                  ? <><span>✓</span><span>Ready to move on to the next topic</span></>
                  : <><span>△</span><span>Strengthen this artifact before moving on</span></>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
