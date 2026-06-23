'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <header className="sticky top-0 z-50 border-b border-[#E8E4DE] bg-[#FAF8F5]">
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
            <span className="hidden sm:block text-[11px] text-[#9B9590] tracking-[0.06em]">182 hrs · 10 weeks · 39 topics</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3.5 py-1.5 rounded-2xl text-[13px] tracking-[0.03em] transition-all ${
                  path === l.href || path.startsWith(l.href + '/')
                    ? 'bg-[#1C1C1A] text-[#FAF8F5]'
                    : 'text-[#6B6560] hover:text-[#1C1C1A] hover:bg-[#EEEBE5]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/"
            className="ml-1 text-[11px] text-[#9B9590] hover:text-[#4A4540] transition-colors px-2 py-1.5"
            title="Switch mode">
            ⇄
          </Link>
        </div>
      </div>
    </header>
  );
}
