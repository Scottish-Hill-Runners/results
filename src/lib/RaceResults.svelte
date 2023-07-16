<script lang="ts">
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addColumnFilters, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import Chart from 'svelte-frappe-charts';
  import { approxFilterPlugin, matchFilterPlugin, yearFilterPlugin } from "$lib/filters";
  import ShrTable from '$lib/ShrTable.svelte';
  import Link from '$lib/Link.svelte';
  import { metric, imperial } from '$lib/units';

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  export let results: Result[];
  export let info: RaceInfo;
  export let blurb: string;
  export let stats: RaceStats;

  const uniqueCategories = new Set<string>();
  const allYears = Object.keys(stats).sort();
  allYears.forEach((y) => Object.keys(stats[y]).forEach(c => uniqueCategories.add(c)));
  const allCategories = Array.from(uniqueCategories).sort();
  const raceCategories = new Set<string>();
  results.forEach(r => Object.keys(r.categoryPos).forEach((c) => raceCategories.add(c)));

  let category = 'All';
  let categoryResults = writable(results);
  $: $categoryResults = category == 'All' ? results : results.filter(r => r.categoryPos[category]);

  const plugins = {
    sort: addSortBy<RaceInfo>({
      disableMultiSort: true,
      initialSortKeys: [
        { id: 'position', order: 'asc' },
        { id: 'year', order: 'desc' }
      ]
    }),
    page: addPagination<Result>(),
    filter: addColumnFilters<Result>()
  };
  const table = createTable(categoryResults, plugins);
  const columns = [
    table.column({
      header: 'Year',
      accessor: 'year',
      plugins: { filter: yearFilterPlugin }
    }),
    table.column({
      header: 'Position',
      id: 'position',
      accessor: (row) => category == 'All' ? row.position : row.categoryPos[category]
    }),
    table.column({
      header: 'Name',
      accessor: 'name',
      plugins: { filter: approxFilterPlugin },
      cell: ({ row }) =>
        row.isData()
        ? (row.original.name.startsWith("*")
          ? row.original.name.substring(1)
          : createRender(Link, { href: `runner?name=${row.original.name}&club=${row.original.club}`, text: row.original.name }))
        : ''
      }),
    table.column({
      header: 'Club',
      accessor: 'club',
      plugins: { filter: matchFilterPlugin }
    }),
    table.column({
      header: 'Cat.',
      accessor: 'category'
    }),
    table.column({
      header: 'Time',
      accessor: 'time'
    })
  ];
  const tableViewModel = table.createViewModel(table.createColumns(columns))

  const tabs = ['About', 'Results', 'Stats'];
  let activeTab = 'Results';
  const switchTab = (tab: string) => () => (activeTab = tab);
</script>

<h1>{info.title}</h1>

<h2>{info.venue},
  distance: {units.distance.scale(info.distance)} {units.distance.unit}
  {#if info.climb}, climb: {units.ascent.scale(info.climb)} {units.ascent.unit}{/if}
</h2>

<ul class="tab">
  {#each tabs as tab, i}
    <li class={activeTab === tab ? 'active' : ''}>
      <span role="tab" tabindex={i} on:click={switchTab(tab)} on:keydown={switchTab(tab)}>{tab}</span>
    </li>
  {/each}
</ul>

{#if activeTab == 'About'}
  <div class='recordHolders'>
  {#if info.record}
    <div class='recordHolder'>Record: {info.record}</div>
  {/if}
  {#if info.femaleRecord}
    <div class='recordHolder'>Female record: {info.femaleRecord}</div>
  {/if}
  </div>

  {@html blurb}
{/if}

{#if activeTab == 'Stats'}
  <Chart
    title="Number of runners (by category)"
    data={{
      labels: allYears,
      datasets: allCategories.map((cat) => { return { name: cat, values: allYears.map(year => stats[year][cat]) } })
    }}
    type="bar"
    barOptions={{ stacked: 1}} />
{/if}

{#if activeTab == 'Results'}
<div role="radiogroup"
		 class="group-container"
		 aria-labelledby="category"
		 id="category">
  {#each ['All', ...raceCategories].sort() as categ}
    <input
      class="sr-only"
      type="radio"
      bind:group={category}
      value={categ} />
    <label for={categ}> {categ} </label>
  {/each}
</div>

  <ShrTable tableViewModel={tableViewModel} />
{/if}
