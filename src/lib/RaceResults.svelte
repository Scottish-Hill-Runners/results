<script lang="ts">
  import { readable } from 'svelte/store';
  import { page } from '$app/stores';
  import { createRender, createTable } from 'svelte-headless-table';
  import { addColumnOrder, addColumnFilters, addPagination, addSortBy } from 'svelte-headless-table/plugins';
  import { categFilterPlugin, matchFilterPlugin, textFilterPlugin, yearFilterPlugin } from "$lib/filters";
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
      header: 'Cat.Pos',
      id: 'categ-pos',
      accessor: (row) => Object.keys(row['categoryPos']).map(function(k) { return k + ":" + row['categoryPos'][k] }).join(", ")
    }),
    table.column({
      header: 'Name',
      accessor: 'name',
      plugins: { filter: textFilterPlugin },
      cell: ({ row }) =>
        createRender(Link, { href: `runner?name=${row.original.name}`, text: row.original.name })
      }),
    table.column({
      header: 'Club',
      accessor: 'club',
      plugins: { filter: matchFilterPlugin }
    }),
    table.column({
      header: 'Cat.',
      accessor: 'category',
      plugins: { filter: categFilterPlugin }
    }),
    table.column({
      header: 'Time',
      accessor: 'time'
    })
  ];
  const tableViewModel = table.createViewModel(table.createColumns(columns))

const tabs = ['About', 'Results', 'Stats'];
let activeTab = 'About';

const handleClick = (tab: string) => () => (activeTab = tab);
</script>

<h1>{info.title}</h1>

<h2>{info.venue},
  distance: {units.distance.scale(info.distance)} {units.distance.unit}{#if info.climb}, climb: {units.ascent.scale(info.climb)} {units.ascent.unit}{/if}
</h2>

<ul>
  {#each tabs as tab}
    <li class={activeTab === tab ? 'active' : ''}>
      <span on:click={handleClick(tab)} on:keydown={handleClick(tab)}>{tab}</span>
    </li>
  {/each}
</ul>

{#if activeTab == 'About'}
  <div class='recordHolders'>
  {#if info.record !== undefined}
    <div class='recordHolder'>Record: {info.record}</div>
  {/if}
  {#if info.femaleRecord !== undefined}
    <div class='recordHolder'>Female record: {info.femaleRecord}</div>
  {/if}
  </div>

  {@html blurb}
{/if}

{#if activeTab == 'Stats'}
  <table class="stats content">
    <caption>Number of runners by year</caption>
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
{/if}

{#if activeTab == 'Results'}
  <ShrTable tableViewModel={tableViewModel} />
{/if}

<style type="text/css">
  ul {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    border-bottom: 1px solid #dee2e6;
  }

  span {
    border: 1px solid transparent;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: block;
    padding: 0.5rem 1rem;
    cursor: pointer;
  }

  span:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  li.active > span {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  .stats {
    border: none;
    border-collapse: collapse;
    border-color: #aabcfe;
    border-spacing: 0;
    margin: 0px auto;
  }

  .stats td {
    background-color: #e8edff;
    border-color: #aabcfe;
    border-style: solid;
    border-width: 0px;
    color: #669;
    overflow: hidden;
    padding: 0px 0px;
    text-align: right;
  }

  .stats th {
    background-color: #b9c9fe;
    border-color: #aabcfe;
    border-style: solid;
    border-width: 0px;
    color: #039;
    font-weight: bold;
    overflow: hidden;
    padding: 2px 5px;
  }
</style>
