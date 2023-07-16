import { createRender } from 'svelte-headless-table';
import type { ColumnFiltersColumnOptions } from 'svelte-headless-table/lib/plugins/addColumnFilters';
import TextFilter from "$lib/TextFilter.svelte";
import SelectFilter from "$lib/SelectFilter.svelte";
import YearFilter from "$lib/SelectFilter.svelte";

export const textFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: ({ value, filterValue }) => value.toLowerCase().startsWith(filterValue.toLowerCase()),
  initialFilterValue: '',
  render: (arg) => createRender(TextFilter, arg)
}

export const approxFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: ({ value, filterValue }) => value.toLowerCase().includes(filterValue.toLowerCase()),
  initialFilterValue: '',
  render: (arg) => createRender(TextFilter, arg)
}

export const matchFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: ({ value, filterValue }) => filterValue === 'All' || filterValue === value,
  render: (arg) => createRender(SelectFilter, arg)
}

export const categFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: ({ value, filterValue }) => filterValue === 'All' || value.startsWith(filterValue),
  render: (arg) => createRender(SelectFilter, arg)
}

export const yearFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: ({ value, filterValue }) => filterValue === 'All*' || filterValue == 'All' ? !value.endsWith("*") : filterValue === value,
  initialFilterValue: 'All',
  render: (arg) => createRender(SelectFilter, arg)
}
