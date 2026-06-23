'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    setSaved(localStorage.getItem('fi-mode'));
  }, []);

  function pick(mode: 'pre-joining' | 'onboarding') {
    localStorage.setItem('fi-mode', mode);
    router.push(mode === 'pre-joining' ? '/dashboard' : '/onboarding/dashboard');
  }

  const tiles = [
    {
      mode: 'pre-joining' as const,
      title: 'Pre-joining KT',
      subtitle: 'June 8 → August 8, 2026',
      desc: 'Self-paced learning plan across AI, Finance, FundsIndia & SDLC — built for the weeks before you join.',
      color: '#2D6A4F',
      accent: '#B7E4C7',
      stats: '182h · 10 weeks · 39 topics',
    },
    {
      mode: 'onboarding' as const,
      title: 'Onboarding KT',
      subtitle: 'Starting Day 1',
      desc: 'Structured knowledge transfer for your first weeks at FundsIndia. Topics being set up.',
      color: '#6B3FA0',
      accent: '#D7BDE2',
      stats: 'Topics coming soon',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9B9590] mb-3">FundsIndia</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-[38px] sm:text-[48px] font-bold tracking-tight text-[#1C1C1A] mb-3">
            FI Prep
          </h1>
          <p className="text-sm text-[#6B6560]">Choose your learning mode to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {tiles.map(t => {
            const isActive = saved === t.mode;
            return (
              <button
                key={t.mode}
                onClick={() => pick(t.mode)}
                className="text-left rounded-2xl p-6 border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]"
                style={{
                  borderColor: isActive ? t.color : '#E8E4DE',
                  background: isActive ? t.accent : '#FFFFFF',
                }}
              >
                {isActive && (
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3"
                    style={{ background: t.color, color: '#FAF8F5' }}>
                    Last used
                  </span>
                )}
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: t.color }}>
                  {t.subtitle}
                </p>
                <h2 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold text-[#1C1C1A] mb-2">
                  {t.title}
                </h2>
                <p className="text-[13px] text-[#6B6560] leading-relaxed mb-4">{t.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9B9590]">{t.stats}</span>
                  <span className="text-[13px] font-semibold" style={{ color: t.color }}>
                    Open →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
