'use client';

import { useEffect, useState } from 'react';
import { useUnits } from '@/components/UnitsProvider';
import { mToFeet } from '@/lib/units';

interface ElevationProfileProps {
  raceId: string;
  raceName: string;
}

interface ElevationStats {
  gain: number;
  loss: number;
  minEle: number;
  maxEle: number;
  totalDistKm: number;
}

export default function ElevationProfile({ raceId, raceName }: ElevationProfileProps) {
  const { imperial } = useUnits();
  const [stats, setStats] = useState<ElevationStats | null | false>(null);
  const [imgStatus, setImgStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/results/${encodeURIComponent(raceId)}-elevation-stats.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: ElevationStats) => { if (!cancelled) { setStats(data); } })
      .catch(() => { if (!cancelled) setStats(false); });
    return () => { cancelled = true; };
  }, [raceId]);

  // No elevation data available for this race — render nothing
  if (stats === false) return null;

  const toEle = (m: number) =>
    imperial ? `${Math.round(mToFeet(m))} ft` : `${Math.round(m)} m`;

  const statItems = stats
    ? [
        { label: 'Total ascent', value: `↑ ${toEle(stats.gain)}` },
        { label: 'Total descent', value: `↓ ${toEle(stats.loss)}` },
        { label: 'Highest point', value: toEle(stats.maxEle) },
        { label: 'Lowest point', value: toEle(stats.minEle) },
      ]
    : null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Elevation profile</h3>

      {/* Chart */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
        {imgStatus === 'loading' && (
          <div className="flex h-[200px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
          </div>
        )}
        {imgStatus === 'error' && (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">Elevation data unavailable.</p>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/results/${encodeURIComponent(raceId)}-elevation.svg`}
          alt={`Elevation profile for ${raceName}`}
          className={imgStatus === 'ready' ? 'block w-full' : 'hidden'}
          onLoad={() => setImgStatus('ready')}
          onError={() => setImgStatus('error')}
        />
      </div>

      {/* Stats strip */}
      {statItems && (
        <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {statItems.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60"
            >
              <dt className="text-xs text-gray-500 dark:text-slate-400">{label}</dt>
              <dd className="mt-0.5 font-semibold text-gray-900 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
