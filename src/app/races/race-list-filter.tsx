'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { RaceInfo } from '@/types/datatable';

interface RaceListFilterProps {
  races: RaceInfo[];
}

export default function RaceListFilter({ races }: RaceListFilterProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return races;
    return races.filter(
      (r) =>
        r.title.toLowerCase().includes(needle) ||
        r.venue.toLowerCase().includes(needle),
    );
  }, [races, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="race-search" className="sr-only">
          Search races
        </label>
        <input
          id="race-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or venue…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">No races match your search.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((race) => (
            <li key={race.raceId}>
              <Link
                href={`/races/${encodeURIComponent(race.raceId)}`}
                className="block px-4 py-3 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-gray-50"
              >
                <div className="font-semibold">{race.title}</div>
                <div className="text-sm text-gray-600">{race.venue} • {race.distance}km</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
