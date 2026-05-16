'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS: { href: string; label: string }[] = [
  { href: '/dashboard', label: 'Головна' },
  { href: '/generator', label: 'Генератор' },
  { href: '/vector-codes', label: 'Монолітні коди' },
  { href: '/cyclic-codes', label: 'Циклічні коди' },
  { href: '/simulation', label: 'Симуляція' },
  { href: '/theory', label: 'Теорія' },
  { href: '/tests', label: 'Тести' },
  { href: '/profile', label: 'Профіль' },
];

export default function GlobalTopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-sm"
      aria-label="Головна навігація по розділах"
    >
      <div className="flex items-center gap-1 overflow-x-auto px-3 sm:px-5 py-2.5 scrollbar-thin">
        {LINKS.map(({ href, label }) => {
          const active =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
