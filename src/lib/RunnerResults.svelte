<script lang="ts">
  import { readable } from 'svelte/store';
  import { page } from '$app/stores';
  import Chart from 'svelte-frappe-charts';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import ShrTable from '$lib/ShrTable.svelte';
  import Link from '$lib/Link.svelte';
  import { metric, imperial } from '$lib/units';

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  export let results: RunnerInfo[];
  export let stats: { year: string, nRaces: number, totalDistance: number, totalAscent: number }[];
  const sortedStats = stats.sort((a, b) => a.year.localeCompare(b.year));
  const years = sortedStats.map(s => s.year);

  const plugins = {
    sort: addSortBy<RunnerInfo>({
      disableMultiSort: true,
      initialSortKeys: [
        { id: 'year', order: 'desc' },
        { id: 'race', order: 'asc' }
      ]
    }),
    page: addPagination<RunnerInfo>()
  };
  const table = createTable(readable(results), plugins);
  const columns = [
    table.column({
      header: 'Race',
      id: 'race',
      accessor: 'title',
      cell: ({ row }) =>
        row.isData() ? createRender(Link, { href: row.original.raceId, text: row.original.title }) : ''
    }),
    table.column({ header: 'Year', accessor: 'year' }),
    table.column({ header: 'Pos', accessor: 'position' }),
    table.column({
      header: 'Cat.Pos',
      id: 'categ-pos',
      accessor: (row) => Object.entries(row.categoryPos).map(([k, v]) => `${k}:${v}`).join(", ")
    }),
    table.column({ header: 'Time', accessor: 'time' }),
    table.column({
      header: `Distance (${units.distance.unit})`,
      id: 'distance', 
      accessor: (row) => units.distance.scale(row.distance),
      plugins: { sort: { getSortValue: (v) => parseInt(v) }}
    }),
    table.column({
      header: `Ascent (${units.ascent.unit})`,
      id: 'climb',
      accessor: (row) => units.ascent.scale(row?.climb ?? 0),
      plugins: { sort: { getSortValue: (v) => parseInt(v) }}
    })
  ];

  const tabs = ['Results', 'Stats'];
  let activeTab = 'Results';
  const switchTab = (tab: string) => () => (activeTab = tab);
</script>

<ul class="tab">
  {#each tabs as tab, i}
    <li class={activeTab === tab ? 'active' : ''}>
      <span role="tab" tabindex={i} on:click={switchTab(tab)} on:keydown={switchTab(tab)}>{tab}</span>
    </li>
  {/each}
</ul>

{#if activeTab == 'Results'}
  <ShrTable tableViewModel={table.createViewModel(table.createColumns(columns))} />
{/if}

{#if activeTab == 'Stats'}
  <Chart
      title="Number of races"
      data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.nRaces) }]}}
      type="bar" />
  <Chart
    title={`Total distance (${units.distance.unit})`}
    data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalDistance) }]}}
    type="bar" />
  <Chart 
    title={`Total ascent (${units.ascent.unit})`}
    data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalAscent) }]}}
    type="bar" />
{/if}
