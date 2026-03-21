'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface NewsItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

interface NewsListProps {
  items: NewsItem[];
}

export default function NewsList({ items }: NewsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (slug: string) => {
    setExpandedId(expandedId === slug ? null : slug);
  };

  return (
    <div className="w-full space-y-3">
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No news items available</p>
      ) : (
        items.map((item) => (
          <article
            key={item.slug}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => toggleExpand(item.slug)}
              className="w-full text-left p-4 flex items-start justify-between hover:bg-gray-50 transition-colors"
              aria-expanded={expandedId === item.slug}
            >
              <div className="flex-1 min-w-0">
                <time className="text-xs text-gray-500 uppercase tracking-wide">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
                <h3 className="text-lg font-semibold text-gray-900 mt-1 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {item.excerpt}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center">
                <span
                  className={`text-gray-400 text-xl transition-transform ${
                    expandedId === item.slug ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </div>
            </button>

            {expandedId === item.slug && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <div className="prose prose-sm max-w-none text-gray-700 mt-4">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}
