'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/plan',      label: 'Plan' },
  { href: '/schedule',  label: 'Schedule' },
];

export default function AppNav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8E4DE] bg-[#FAF8F5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-baseline gap-2.5">
          <Link href="/dashboard" className="font-[family-name:var(--font-playfair)] text-[17px] font-bold tracking-tight text-[#1C1C1A]">
            FI Prep
          </Link>
          <span className="hidden sm:block text-[11px] text-[#9B9590] tracking-[0.06em]">155 hrs · 8 weeks · 32 topics</span>
        </div>
        <nav className="flex gap-1">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3.5 py-1.5 rounded-2xl text-[13px] tracking-[0.03em] transition-all ${
                path.startsWith(l.href)
                  ? 'bg-[#1C1C1A] text-[#FAF8F5]'
                  : 'text-[#6B6560] hover:text-[#1C1C1A] hover:bg-[#EEEBE5]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
