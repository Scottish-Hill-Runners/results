import { createRender } from 'svelte-headless-table';
import type { ColumnFiltersColumnOptions, ColumnFilterFn } from 'svelte-headless-table/lib/plugins/addColumnFilters';
import TextFilter from "$lib/TextFilter.svelte";
import SelectFilter from "$lib/SelectFilter.svelte";

const textPrefixMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  value.toLowerCase().startsWith(filterValue.toLowerCase());

const textApproxMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  value.toLowerCase().includes(filterValue.toLowerCase());

const exactMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  filterValue === 'All' || filterValue === value;

const categMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  filterValue === 'All' || value.startsWith(filterValue);

const yearMatch: ColumnFilterFn<string, string> = ({ value, filterValue }) =>
  filterValue === 'All' ? !value.endsWith("*") : filterValue === value;

export const textFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: textPrefixMatch,
  initialFilterValue: '',
  render: (arg) => createRender(TextFilter, arg)
}

export const approxFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: textApproxMatch,
  initialFilterValue: '',
  render: (arg) => createRender(TextFilter, arg)
}

export const matchFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: exactMatch,
  render: (arg) => createRender(SelectFilter, arg),
}

export const categFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: categMatch,
  render: (arg) => createRender(SelectFilter, arg),
}

export const yearFilterPlugin: ColumnFiltersColumnOptions<any, string> = {
  fn: yearMatch,
  initialFilterValue: 'All',
  render: (arg) => createRender(SelectFilter, arg),
}
