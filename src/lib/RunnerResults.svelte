<script lang="ts">
  import { readable } from 'svelte/store';
  import { page } from '$app/stores';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addColumnOrder, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import ShrTable from '$lib/ShrTable.svelte';
  import Link from '$lib/Link.svelte';
  import { metric, imperial } from '$lib/units';

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  export let results: RunnerInfo[];

  const plugins = {
    sort: addSortBy<RunnerInfo>({
      disableMultiSort: true,
      initialSortKeys: [
        { id: 'year', order: 'desc' },
        { id: 'race', order: 'asc' }
      ]
    }),
    colOrder: addColumnOrder<RunnerInfo>(),
    page: addPagination<RunnerInfo>()
  };
  const table = createTable(readable(results), plugins);
  const columns = [
    table.column({
      header: 'Race',
      id: 'race',
      accessor: 'title',
      cell: ({ row }) =>
        createRender(Link, { href: row.original.raceId, text: row.original.title })
    }),
    table.column({ header: 'Year', accessor: 'year' }),
    table.column({ header: 'Pos', accessor: 'position' }),
    table.column({
      header: 'Cat.Pos',
      id: 'categ-pos',
      accessor: (row) => Object.keys(row['categoryPos']).map(function(k) { return k + ":" + row['categoryPos'][k] }).join(", ")
    }),
    table.column({ header: 'Cat.', accessor: 'category' }),
    table.column({ header: 'Time', accessor: 'time' }),
    table.column({
      header: `Distance (${units.distance.unit})`,
      id: 'distance', 
      accessor: (row) => units.distance.scale(row['distance']),
      plugins: { sort: { getSortValue: (v) => parseInt(v) }}
    }),
    table.column({
      header: `Ascent (${units.ascent.unit})`,
      id: 'climb',
      accessor: (row) => row['climb'] === undefined ? '' : units.ascent.scale(row['climb']),
      plugins: { sort: { getSortValue: (v) => parseInt(v) }}
    })
  ];
</script>

<ShrTable tableViewModel={table.createViewModel(table.createColumns(columns))} />
  