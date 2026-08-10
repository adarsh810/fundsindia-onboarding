'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SHADOW_SUBTLE, SHADOW_RAISED, shadowFloat } from '@/lib/elevation';
import { TOTAL_HOURS, ALL_TOPICS } from '@/lib/data';

export default function Home() {
  const router = useRouter();
  const [saved, setSaved]     = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    setSaved(localStorage.getItem('fi-mode'));
  }, []);

  function pick(mode: 'pre-joining' | 'onboarding') {
    localStorage.setItem('fi-mode', mode);
    router.push(mode === 'pre-joining' ? '/dashboard' : '/onboarding/dashboard');
  }

  const tiles = [
    {
      mode:       'pre-joining' as const,
      title:      'Auxiliary',
      subtitle:   'Self-paced · 10 weeks',
      desc:       'Self-paced learning plan across AI, Finance, FundsIndia & Software Dev — broad context before you dive in.',
      color:      '#2D6A4F',
      colorDark:  '#1F5240',
      colorLight: '#3D8A65',
      accent:     '#B7E4C7',
      stats:      `${TOTAL_HOURS}h · 10 weeks · ${ALL_TOPICS.length} topics`,
    },
    {
      mode:       'onboarding' as const,
      title:      'Core FundsIndia',
      subtitle:   'Day 1 onwards',
      desc:       'Deep knowledge transfer on FundsIndia flows, architecture, and strategy — the stuff that matters on the job.',
      color:      '#6B3FA0',
      colorDark:  '#52308A',
      colorLight: '#8B5BC0',
      accent:     '#D7BDE2',
      stats:      'FundsIndia 101 · flows · architecture',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9B9590] mb-4">FundsIndia</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-[42px] sm:text-[52px] font-bold tracking-tight text-[#1C1C1A] mb-3 leading-[1.1]">
            Gyaan
          </h1>
          <p className="text-[14px] text-[#6B6560]">Choose your learning mode to continue</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          {tiles.map(t => {
            const isActive  = saved === t.mode;
            const isHovered = hovered === t.mode;

            return (
              <button
                key={t.mode}
                onClick={() => pick(t.mode)}
                onMouseEnter={() => setHovered(t.mode)}
                onMouseLeave={() => setHovered(null)}
                className="relative text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 active:scale-[0.97]"
                style={{
                  borderColor: isActive
                    ? t.color
                    : isHovered ? `${t.color}55` : '#E8E4DE',
                  background: isActive
                    ? `linear-gradient(148deg, ${t.accent}95 0%, rgba(255,255,255,0.97) 58%)`
                    : 'linear-gradient(148deg, #ffffff 0%, #F6F3EF 100%)',
                  boxShadow: isHovered
                    ? shadowFloat(t.color)
                    : isActive
                    ? `${SHADOW_RAISED}, 0 4px 16px ${t.color}22`
                    : SHADOW_SUBTLE,
                  transform: isHovered ? 'translateY(-6px)' : undefined,
                }}
              >
                {/* Gloss overlay — subtle light catch, only visible on active (tinted) surface */}
                {isActive && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(155deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 36%)',
                      borderRadius: 'inherit',
                    }}
                  />
                )}

                {/* Top accent bar — luminosity gradient */}
                <div
                  className="relative h-[3px] w-full"
                  style={{
                    background: `linear-gradient(90deg, ${t.colorDark} 0%, ${t.color} 45%, ${t.colorLight} 100%)`,
                  }}
                />

                <div className="relative p-6">
                  {isActive && (
                    <span
                      className="inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full mb-3"
                      style={{ background: t.color, color: '#FAF8F5' }}
                    >
                      Last used
                    </span>
                  )}

                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: t.color }}>
                    {t.subtitle}
                  </p>
                  <h2 className="font-[family-name:var(--font-playfair)] text-[22px] font-bold text-[#1C1C1A] mb-2.5">
                    {t.title}
                  </h2>
                  <p className="text-[13px] text-[#6B6560] leading-relaxed mb-5">{t.desc}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#9B9590]">{t.stats}</span>

                    {/* Glossy CTA pill — luminosity gradient */}
                    <span
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-1.5 rounded-full text-white transition-all duration-200"
                      style={{
                        background: `linear-gradient(135deg, ${t.colorLight} 0%, ${t.color} 50%, ${t.colorDark} 100%)`,
                        boxShadow: isHovered
                          ? `${SHADOW_RAISED}, 0 4px 14px ${t.color}55`
                          : `0 2px 8px ${t.color}40`,
                      }}
                    >
                      Open
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2.5 6h7m0 0L6.5 3m3 3L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
