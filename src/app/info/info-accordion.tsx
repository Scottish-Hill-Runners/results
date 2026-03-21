"use client";

import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';

interface InfoItem {
  slug: string;
  title: string;
  content: string;
}

interface InfoAccordionProps {
  items: InfoItem[];
}

function normalizeMarkdown(markdown: string): string {
  // Convert non-breaking spaces from scraped content into regular spaces.
  return markdown.replace(/\u00a0/g, ' ');
}

function mergeClasses(base: string, className?: string): string {
  return className ? `${base} ${className}` : base;
}

const shiftedHeadingComponents: Components = {
  h1: ({ className, ...props }) => (
    <h3
      {...props}
      className={mergeClasses('mt-8 mb-4 text-3xl font-semibold text-slate-900', className)}
    />
  ),
  h2: ({ className, ...props }) => (
    <h4
      {...props}
      className={mergeClasses('mt-7 mb-3 text-2xl font-semibold text-slate-900', className)}
    />
  ),
  h3: ({ className, ...props }) => (
    <h5
      {...props}
      className={mergeClasses('mt-6 mb-3 text-xl font-semibold text-slate-900', className)}
    />
  ),
  h4: ({ className, ...props }) => (
    <h6
      {...props}
      className={mergeClasses('mt-5 mb-2 text-lg font-semibold text-slate-900', className)}
    />
  ),
  h5: ({ className, ...props }) => (
    <h6
      {...props}
      className={mergeClasses('mt-4 mb-2 text-base font-semibold text-slate-900', className)}
    />
  ),
  h6: ({ className, ...props }) => (
    <p
      {...props}
      className={mergeClasses('mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700', className)}
    />
  ),
};

export default function InfoAccordion({ items }: InfoAccordionProps) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = item.slug === activeSlug;
        const buttonId = `info-accordion-button-${item.slug}`;
        const panelId = `info-accordion-panel-${item.slug}`;

        return (
          <section key={item.slug} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h2>
              <button
                id={buttonId}
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-xl font-semibold text-slate-900 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setActiveSlug((current) => (current === item.slug ? null : item.slug))}
              >
                <span>{item.title}</span>
                <span
                  className={
                    isOpen
                      ? 'relative block h-4 w-4 text-slate-500 transition-transform duration-300 ease-out rotate-180 motion-reduce:transition-none'
                      : 'relative block h-4 w-4 text-slate-500 transition-transform duration-300 ease-out rotate-0 motion-reduce:transition-none'
                  }
                  aria-hidden="true"
                >
                  <span className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 rounded bg-current" />
                  <span
                    className={
                      isOpen
                        ? 'absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rounded bg-current transition-transform duration-300 ease-out scale-y-0 motion-reduce:transition-none'
                        : 'absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rounded bg-current transition-transform duration-300 ease-out scale-y-100 motion-reduce:transition-none'
                    }
                  />
                </span>
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className={
                isOpen
                  ? 'grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-300 ease-out opacity-100 motion-reduce:transition-none'
                  : 'grid grid-rows-[0fr] transition-[grid-template-rows,opacity] duration-300 ease-out opacity-0 motion-reduce:transition-none'
              }
            >
              <div className="overflow-hidden px-5 pb-5">
                <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-semibold prose-li:marker:text-slate-500">
                  <ReactMarkdown components={shiftedHeadingComponents}>
                    {normalizeMarkdown(item.content)}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
