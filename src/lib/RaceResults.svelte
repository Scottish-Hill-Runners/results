<script lang="ts">
  import { readable } from 'svelte/store';
  import { createTable } from 'svelte-headless-table';
  import { addColumnOrder, addColumnFilters, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import { matchFilterPlugin, textFilterPlugin, yearFilterPlugin } from "$lib/filters"; 
  import ShrTable from '$lib/ShrTable.svelte';

  export let results: Result[];
  export let title: string;
  export let blurb: string;
  export let record: string;
  export let femaleRecord: string;
  export let stats: RaceStats;

  const uniqueCategories = new Set<string>();
  const allYears = Object.keys(stats).sort();
  allYears.forEach((y) => Object.keys(stats[y]).forEach(c => uniqueCategories.add(c)));
  const allCategories = Array.from(uniqueCategories).sort();

  const plugins = {
    sort: addSortBy<RaceInfo>({
      disableMultiSort: true,
      initialSortKeys: [{ id: 'time', order: 'asc' }]
    }),
    colOrder: addColumnOrder<Result>(),
    page: addPagination<Result>(),
    filter: addColumnFilters<Result>()
  };
  const table = createTable(readable(results), plugins);
  const columns = [
    table.column({
      header: 'Year',
      accessor: 'year',
      plugins: { filter: yearFilterPlugin }
    }),
    table.column({
      header: 'Pos',
      accessor: 'position'
    }),
    table.column({
      header: 'Forename',
      accessor: 'forename',
      plugins: { filter: textFilterPlugin }
    }),
    table.column({
      header: 'Surname',
      accessor: 'surname',
      plugins: { filter: textFilterPlugin }
    }),
    table.column({
      header: 'Club',
      accessor: 'club',
      plugins: { filter: matchFilterPlugin }
    }),
    table.column({
      header: 'Cat.',
      accessor: 'category',
      plugins: { filter: matchFilterPlugin }
    }),
    table.column({
      header: 'Time',
      accessor: 'time'
    })
  ];
  const tableViewModel = table.createViewModel(table.createColumns(columns))
</script>

<h1>{title}</h1>

<div class='recordHolders'>
{#if record !== undefined}
  <div class='recordHolder'>Record: {record}</div>
{/if}
{#if femaleRecord !== undefined}
  <div class='recordHolder'>Female record: {femaleRecord}</div>
{/if}
</div>

{@html blurb}

<h2>Statistics</h2>
<table>
  <thead>
    <tr>
      <th></th>{#each allYears as year} <th>{year}</th>{/each}
    </tr>
  </thead>
  <tbody>
    {#each allCategories as category}
      <tr>
        <th>{category}</th>
        {#each allYears as year} <td>{stats[year][category] ?? ''}</td>{/each}
      </tr>
    {/each}<tr>
      <th>Total</th>
      {#each allYears as year} <td>{Object.values(stats[year]).reduce((t, r) => t + r, 0)}</td>{/each}
    </tr>
  </tbody>
</table>

<ShrTable tableViewModel={tableViewModel} />
