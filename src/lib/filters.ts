import { createRender } from 'svelte-headless-table';
import type { ColumnFiltersColumnOptions, ColumnFilterFn } from 'svelte-headless-table/lib/plugins/addColumnFilters';
import TextFilter from "$lib/TextFilter.svelte";
import SelectFilter from "$lib/SelectFilter.svelte";
  
const textPrefixMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  value.toLowerCase().startsWith(filterValue.toLowerCase());

const exactMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  filterValue === 'All' || filterValue === value;

const yearMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  filterValue === 'All' ? !value.endsWith("*") : filterValue === value;

export const textFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: textPrefixMatch,
  initialFilterValue: '',
  render: (arg) => createRender(TextFilter, arg)
}

export const matchFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: exactMatch,
  render: (arg) => createRender(SelectFilter, arg),
}

export const yearFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: yearMatch,
  initialFilterValue: 'All',
  render: (arg) => createRender(SelectFilter, arg),
}
