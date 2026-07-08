'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SHADOW_RAISED } from '@/lib/elevation';
import { TOTAL_HOURS, ALL_TOPICS } from '@/lib/data';

export default function AppNav() {
  const path = usePathname();
  const isOnboarding = path.startsWith('/onboarding');

  const base = isOnboarding ? '/onboarding' : '';
  const LINKS = [
    { href: `${base}/dashboard`, label: 'Dashboard' },
    { href: `${base}/plan`,      label: 'Topics' },
    { href: `${base}/schedule`,  label: 'Schedule' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E4DE] bg-[#FAF8F5]/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-[17px] font-bold tracking-tight text-[#1C1C1A]">
            FI Prep
          </Link>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={isOnboarding
              ? { background: '#D7BDE2', color: '#6B3FA0' }
              : { background: '#B7E4C7', color: '#2D6A4F' }}
          >
            {isOnboarding ? 'Onboarding' : 'Pre-joining'}
          </span>
          {!isOnboarding && (
            <span className="hidden sm:block text-[11px] text-[#9B9590] tracking-[0.06em]">{TOTAL_HOURS} hrs · 10 weeks · {ALL_TOPICS.length} topics</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-1.5 rounded-2xl text-[13px] tracking-[0.03em] transition-all active:scale-[0.97] ${
                  path === l.href || path.startsWith(l.href + '/')
                    ? 'text-[#FAF8F5]'
                    : 'text-[#6B6560] hover:text-[#1C1C1A] hover:bg-[#EEEBE5]'
                }`}
              style={
                path === l.href || path.startsWith(l.href + '/')
                  ? { background: 'linear-gradient(135deg, #2A2A28 0%, #111110 100%)', boxShadow: SHADOW_RAISED }
                  : {}
              }
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/"
            className="ml-1 flex items-center gap-1 text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors px-2.5 py-2 rounded-lg hover:bg-[#EEEBE5] active:scale-[0.97]"
            title="Switch mode"
            aria-label="Switch mode">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M1.5 4.5h8M7 2l2.5 2.5L7 7M11.5 8.5h-8M6 6l-2.5 2.5L6 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="hidden sm:inline">Switch</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
