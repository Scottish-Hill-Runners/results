"use client";

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100" aria-label="Scottish Hill Runners home">
          Scottish Hill Runners
        </Link>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
