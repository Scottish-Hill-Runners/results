<script lang="ts">
  import { readable } from 'svelte/store';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addColumnOrder, addColumnFilters, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import ShrTable from '$lib/ShrTable.svelte';
  import Link from "$lib/Link.svelte";

  export let data: RaceInfo[];

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
      cell: ({ row }) =>
        createRender(Link, { href: row.original.raceId, text: row.original.title })
      }),
      table.column({ header: 'Venue', accessor: 'venue' }),
      table.column({ header: 'Distance', accessor: 'distance' }),
      table.column({ header: 'Ascent', accessor: 'climb' })
    ];
  const tableViewModel = table.createViewModel(table.createColumns(columns))
</script>

<h1>Races</h1>

<ShrTable tableViewModel={tableViewModel} />
