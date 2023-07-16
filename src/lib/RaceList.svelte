<script lang="ts">
  import { readable } from 'svelte/store';
  import { page } from '$app/stores';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addColumnOrder, addColumnFilters, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import { approxFilterPlugin } from "$lib/filters";
  import ShrTable from '$lib/ShrTable.svelte';
  import Link from '$lib/Link.svelte';
  import { metric, imperial } from '$lib/units';

  export let data: RaceInfo[];

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;
  const plugins = {
    sort: addSortBy<RaceInfo>({
      disableMultiSort: true,
      initialSortKeys: [{ id: 'title', order: 'asc' }]
    }),
    colOrder: addColumnOrder<RaceInfo>(),
    page: addPagination<RaceInfo>(),
    filter: addColumnFilters<RaceInfo>()
  };
  const table = createTable(readable(data), plugins);
  const columns = [
    table.column({
      header: 'Name',
      accessor: 'title',
      plugins: { filter: approxFilterPlugin },
      cell: ({ row }) =>
        row.isData() ? createRender(Link, { href: row.original.raceId, text: row.original.title }) : ''
      }),
      table.column({
        header: 'Venue',
        accessor: 'venue',
        plugins: { filter: approxFilterPlugin }
      }),
      table.column({
        header: `Distance (${units.distance.unit})`,
        id: 'distance', 
        accessor: (row) => units.distance.scale(row.distance),
        plugins: { sort: { getSortValue: (v) => parseInt(v) }}
      }),
      table.column({
        header: `Ascent (${units.ascent.unit})`,
        id: 'climb',
        accessor: (row) => row.climb === undefined ? '' : units.ascent.scale(row.climb),
        plugins: { sort: { getSortValue: (v) => parseInt(v) }}
      })
    ];
  const tableViewModel = table.createViewModel(table.createColumns(columns));
</script>

<h1>Races</h1>

<ShrTable tableViewModel={tableViewModel} />
