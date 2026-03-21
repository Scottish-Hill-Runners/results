"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/races', label: 'Races' },
  { href: '/info', label: 'Info' },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900" aria-label="Scottish Hill Running home">
          Scottish Hill Running
        </Link>
        <nav aria-label="Primary" className="flex gap-4 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600'
                    : 'text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
