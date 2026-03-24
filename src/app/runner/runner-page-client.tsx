'use client';

import { FormEvent, useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import RaceResultsDataTable from '@/components/RaceResultsDataTable';
import { fetchGzipJson } from '@/lib/client-results-fetch';
import { runnerNameMatches, surnameHash } from '@/lib/runner-name';
import type { RaceResult } from '@/types/datatable';

interface RunnerPageClientProps {
  name?: string;
  runnerNames?: string[];
}

function normalizeSearchValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function RunnerPageClient({ name, runnerNames = [] }: RunnerPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedName = name ?? searchParams.get('name') ?? '';
  const decodedName = useMemo(() => {
    try {
      return decodeURIComponent(encodedName).trim();
    } catch {
      return encodedName.trim();
    }
  }, [encodedName]);

  const surname = useMemo(() => {
    const match = decodedName.match(/(\w+)$/);
    return match ? match[1] : decodedName;
  }, [decodedName]);
  const [query, setQuery] = useState(decodedName);
  const deferredQuery = useDeferredValue(query);

  const [results, setResults] = useState<RaceResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    setQuery(decodedName);
  }, [decodedName]);

  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(deferredQuery);
    if (!normalizedQuery) {
      return runnerNames.slice(0, 8);
    }

    return runnerNames
      .filter((runnerName) => normalizeSearchValue(runnerName).includes(normalizedQuery))
      .slice(0, 8);
  }, [deferredQuery, runnerNames]);

  function goToRunner(nameToOpen: string) {
    const trimmed = nameToOpen.trim();
    if (!trimmed) {
      router.push('/runner');
      return;
    }

    router.push(`/runner?name=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToRunner(query);
  }

  useEffect(() => {
    if (!decodedName) {
      setResults(null);
      setErrorMessage(null);
      setIsNotFound(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    async function loadRunnerData() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      const hash = surnameHash(surname) % 100;
      const batchPath = `/results/R-${hash}.json.gz`;

      const response = await fetchGzipJson<RaceResult[]>(batchPath);

      if (isCancelled) {
        return;
      }

      if (response.status === 'not-found') {
        setIsNotFound(true);
        setResults(null);
      } else if (response.status === 'error') {
        console.error('Failed to fetch runner batch on client:', response.error);
        setErrorMessage('Failed to load runner results. Please try again later.');
        setResults(null);
      } else {
        const filtered = response.data.filter((row) => runnerNameMatches(decodedName, row.name));
        if (filtered.length === 0) {
          setIsNotFound(true);
          setResults(null);
        } else {
          setResults(filtered);
        }
      }

      setIsLoading(false);
    }

    loadRunnerData();
    return () => {
      isCancelled = true;
    };
  }, [decodedName, surname]);

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12 dark:from-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          <ol role="list" className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-100" aria-current="page">
              {decodedName ? decodedName : 'Runner'}
            </li>
          </ol>
        </nav>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-slate-50">
          {decodedName ? `Runner Results: ${decodedName}` : 'Runner Results'}
        </h1>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={handleSubmit}>
            <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              Runner name
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a runner"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              />
            </label>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {suggestions.length > 0 ? (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {query.trim() ? 'Matches' : 'Popular picks'}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((runnerName) => (
                  <button
                    key={runnerName}
                    type="button"
                    onClick={() => goToRunner(runnerName)}
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:border-blue-500 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
                  >
                    {runnerName}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {!decodedName ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-4 text-gray-600 dark:text-slate-300">Search above to find a runner and load their results.</p>
          </div>
        ) : isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">Loading runner results...</p>
          </div>
        ) : isNotFound ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-4 text-gray-600 dark:text-slate-300">No matching results found for {decodedName}.</p>
            <Link
              href="/years/2024"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Year Results
            </Link>
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="mb-2 font-semibold text-red-600">{errorMessage}</p>
            <p className="mb-4 text-gray-600 dark:text-slate-300">Try again in a few minutes.</p>
          </div>
        ) : results ? (
          <RaceResultsDataTable data={results} />
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-slate-900">
            <p className="text-gray-600 dark:text-slate-300">No runner data available.</p>
          </div>
        )}
      </div>
    </main>
  );
}