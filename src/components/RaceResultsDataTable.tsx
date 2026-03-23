'use client';

import { useEffect, useState, useMemo } from 'react';
import { RaceResult } from '@/types/datatable';

interface DataTableProps {
  data: RaceResult[];
}

type SortColumn = keyof RaceResult | null;
type SortDirection = 'asc' | 'desc';

interface Filters {
  year: string;
  name: string;
  club: string;
  category: string;
}

export default function RaceResultsDataTable({ data }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('year');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<Filters>({
    year: '',
    name: '',
    club: '',
    category: '',
  });

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
      let aVal = a[primaryCol];
      let bVal = b[primaryCol];

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
    setSortColumn(null);
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
    const uniqueCategories = Array.from(new Set(result.map((row) => row.category))).sort();
    return uniqueCategories;
  }, [data, filters.year, filters.name, filters.club]);

  // Get unique years from data, sorted in ascending order
  const availableYears = useMemo(() => {
    const uniqueYears = Array.from(new Set(data.map((row) => row.year))).sort((a, b) => b.localeCompare(a));
    return uniqueYears;
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="rounded-lg bg-white p-4 shadow-md dark:bg-slate-900">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Filters</h3>
            {(filters.year || filters.name || filters.club || filters.category || sortColumn) && (
              <button
                onClick={clearFilters}
                className="rounded bg-red-100 px-3 py-1 text-xs text-red-700 transition-colors hover:bg-red-200 dark:bg-red-950/60 dark:text-red-300 dark:hover:bg-red-950"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
      </div>

      {/* Data Table */}
      <div className="shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-screen overflow-y-auto">
            <table className="w-full border-collapse bg-white dark:bg-slate-900">
              <thead>
                <tr className="sticky top-0 border-b-2 border-gray-300 bg-gray-100 dark:border-slate-700 dark:bg-slate-800">
                  <th
                    onClick={() => handleSort('year')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Year {getSortIndicator(sortColumn === 'year' ? 'year' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('position')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {filters.category === '' ? '' : "Category "}Position {getSortIndicator(sortColumn === 'position' ? 'position' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Name {getSortIndicator(sortColumn === 'name' ? 'name' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('club')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Club {getSortIndicator(sortColumn === 'club' ? 'club' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('category')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Category {getSortIndicator(sortColumn === 'category' ? 'category' : null)}
                  </th>
                  <th
                    onClick={() => handleSort('time')}
                    className="cursor-pointer px-6 py-3 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-700"
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
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{row.year}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800 dark:text-slate-200">{filters.category === '' ? row.position : row.categoryPos[filters.category]}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{row.club}</td>
                      <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-200">{row.category}</td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-800 dark:text-slate-200">{row.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-400">
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
