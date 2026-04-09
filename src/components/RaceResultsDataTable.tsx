'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { RaceResult } from '@/types/datatable';

interface DataTableProps {
  data: Array<RaceResult & { raceTitle?: string }>;
  showRaceColumn?: boolean;
  showRaceTitle?: boolean;
}

type SortColumn = 'raceTitle' | 'year' | 'position' | 'name' | 'club' | 'category' | 'time' | null;
type SortDirection = 'asc' | 'desc';

interface Filters {
  year: string;
  name: string;
  club: string;
  category: string;
}

const FILTER_VISIBILITY_STORAGE_KEY = 'raceResults.showFilters';

export default function RaceResultsDataTable({ data, showRaceColumn = false, showRaceTitle = false }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(showRaceColumn ? 'raceTitle' : 'year');
  const [sortDirection, setSortDirection] = useState<SortDirection>(showRaceColumn ? 'asc' : 'desc');
  const [showFilters, setShowFilters] = useState(() => {
    if (typeof window === 'undefined') return true;
    const savedValue = window.localStorage.getItem(FILTER_VISIBILITY_STORAGE_KEY);
    return savedValue === 'true';
  });
  const [filters, setFilters] = useState<Filters>({
    year: '',
    name: '',
    club: '',
    category: '',
  });

  // Persist filter panel preference for future visits.
  useEffect(() => {
    window.localStorage.setItem(FILTER_VISIBILITY_STORAGE_KEY, showFilters ? 'true' : 'false');
  }, [showFilters]);

  // Scroll to top when data changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [data]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    result = result.filter((row) => {
      return (
        (filters.year === '' || row.year.toString().includes(filters.year)) &&
        (filters.name === '' || row.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.club === '' || row.club.toLowerCase().includes(filters.club.toLowerCase())) &&
        (filters.category === '' || (filters.category in row.categoryPos))
      );
    });

    // Apply sorting - year then position as secondary sort
    result.sort((a, b) => {
      let comparison = 0;

      // Primary sort: by sortColumn (or year if no custom sort)
      const primaryCol = sortColumn || 'year';
      let aVal: string | number;
      let bVal: string | number;

      if (primaryCol === 'raceTitle') {
        aVal = a.raceTitle ?? a.raceId;
        bVal = b.raceTitle ?? b.raceId;
      } else {
        aVal = a[primaryCol];
        bVal = b[primaryCol];
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (primaryCol === 'time') {
          if (a['year'].endsWith("*")) aVal = "x" + aVal;
          if (b['year'].endsWith("*")) bVal = "x" + bVal;
        }

        comparison = sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        if (primaryCol === 'position' && filters.category !== '') {
          aVal = a.categoryPos[filters.category];
          bVal =b.categoryPos[filters.category]
        }
        
        comparison = sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Secondary sort: by position if primary sort is by year and values are equal
      if (comparison === 0 && primaryCol === 'year')
        return a.position - b.position;

      // Secondary sort: by year if primary sort is by something else and values are equal
      if (comparison === 0 && primaryCol !== 'year')
        return a.year.localeCompare(b.year);

      return comparison;
    });

    return result;
  }, [data, filters, sortColumn, sortDirection]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({ year: '', name: '', club: '', category: '' });
    setSortColumn(showRaceColumn ? 'raceTitle' : 'year');
    setSortDirection(showRaceColumn ? 'asc' : 'desc');
  };

  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return ' ↕️';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  // Get unique categories from currently filtered data (excluding category filter)
  const availableCategories = useMemo(() => {
    let result = [...data];

    // Apply all filters EXCEPT category
    result = result.filter((row) => {
      return (
        (filters.year === '' || row.year.includes(filters.year)) &&
        (filters.name === '' || row.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (filters.club === '' || row.club.toLowerCase().includes(filters.club.toLowerCase()))
      );
    });

    // Get unique categories, sorted alphabetically
    const uniq = new Set<string>();
    result.forEach((row) => {
      Object.keys(row.categoryPos).forEach((cat) => uniq.add(cat));
    });
    return Array.from(uniq).sort();
  }, [data, filters.year, filters.name, filters.club]);

  // Get unique years from data, sorted in ascending order
  const availableYears = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map((row) => row.year.substring(0, 4)))).sort((a, b) => b.localeCompare(a));
    return uniqueYears;
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Filters</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                aria-expanded={showFilters}
                aria-controls="results-filter-controls"
                className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {(filters.year || filters.name || filters.club || filters.category || sortColumn) && (
                <button
                  onClick={clearFilters}
                  className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          {showFilters && (
            <div id="results-filter-controls" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Filter by Name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Filter by Club..."
                value={filters.club}
                onChange={(e) => handleFilterChange('club', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-screen overflow-y-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-900">
              <thead>
                <tr className="sticky top-0 border-b-2 border-gray-300 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
                  {showRaceColumn && (
                    <th
                      onClick={() => handleSort('raceTitle')}
                      className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Race {getSortIndicator(sortColumn === 'raceTitle' ? 'raceTitle' : null)}
                    </th>
                  )}
                  {!showRaceColumn && (
                    <th
                      onClick={() => handleSort('year')}
                      className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Year {getSortIndicator(sortColumn === 'year' ? 'year' : null)}
                    </th>
                  )}
                  <th
                    onClick={() => handleSort('position')}
                    className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {filters.category === '' ? '' : "Category "}Position {getSortIndicator(sortColumn === 'position' ? 'position' : null)}
                  </th>
                  {showRaceTitle ? (
                    <th
                      onClick={() => handleSort('raceTitle')}
                      className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Race {getSortIndicator(sortColumn === 'raceTitle' ? 'raceTitle' : null)}
                    </th>
                  ) : (
                    <th
                      onClick={() => handleSort('name')}
                      className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      Name {getSortIndicator(sortColumn === 'name' ? 'name' : null)}
                    </th>
                  )}
                  <th
                    onClick={() => handleSort('club')}
                    className="hidden cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:table-cell sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Club {getSortIndicator(sortColumn === 'club' ? 'club' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="hidden cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 md:table-cell md:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Category {getSortIndicator(sortColumn === 'category' ? 'category' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('time')}
                    className="cursor-pointer px-2 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 sm:px-6 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Time {getSortIndicator(sortColumn === 'time' ? 'time' : null)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedData.length > 0 ? (
                  processedData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 transition-colors hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-950'
                      }`}
                    >
                      {showRaceColumn && (
                        <td className="px-2 py-4 text-sm text-gray-800 sm:px-6 dark:text-slate-200">
                          <Link
                            href={`/races/${encodeURIComponent(row.raceId)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {row.raceTitle ?? row.raceId}
                          </Link>
                        </td>
                      )}
                      {!showRaceColumn && (
                        <td className="px-2 py-4 text-sm text-gray-800 sm:px-6 dark:text-slate-200">
                          <Link
                            href={`/years/${encodeURIComponent(row.year.substring(0, 4))}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {row.year}
                          </Link>
                        </td>
                      )}
                      <td className="px-2 py-4 text-sm font-semibold text-gray-800 sm:px-6 dark:text-slate-200">{filters.category === '' ? row.position : row.categoryPos[filters.category]}</td>
                      {showRaceTitle ? (
                        <td className="px-2 py-4 text-sm text-gray-800 sm:px-6 dark:text-slate-200">
                          <Link
                            href={`/races/${encodeURIComponent(row.raceId)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {row.raceTitle ?? row.raceId}
                          </Link>
                        </td>
                      ) : (
                        <td className="px-2 py-4 text-sm font-semibold text-gray-800 sm:px-6 dark:text-slate-200">
                          <Link
                            href={`/runner?name=${encodeURIComponent(row.name)}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {row.name}
                          </Link>
                        </td>
                      )}
                      <td className="hidden px-2 py-4 text-sm text-gray-800 sm:table-cell sm:px-6 dark:text-slate-200">{row.club}</td>
                      <td className="hidden px-2 py-4 text-sm text-gray-800 md:table-cell md:px-6 dark:text-slate-200">{row.category}</td>
                      <td className="px-2 py-4 font-mono text-sm font-semibold text-gray-800 sm:px-6 dark:text-slate-200">{row.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={showRaceColumn ? 6 : 6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
                      No results match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600 dark:text-slate-300">
          Showing {processedData.length} of {data.length} results
        </div>
      </div>
    );
  }
