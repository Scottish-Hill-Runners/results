<script lang="ts">
  import { page } from '$app/stores';
  import { Alert, Banner, Button, Chart, Checkbox, Dropdown, Heading, Tabs, TabItem } from 'flowbite-svelte';
  import { CaretDownSolid } from 'flowbite-svelte-icons';
  import { metric, imperial } from '$lib/units';
  import { compareCategoryPos } from './compareCategoryPos';
  import VirtualTable from './VirtualTable.svelte';

  export let results: RunnerInfo[];

  const uniqueClubs = new Set<string>();
  for (const result of results)
    uniqueClubs.add(result.club);

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial : metric;
  const columns: { [key: string]: ColumnSpec<RunnerInfo> } = {
    "year": {
      header: "Year",
      sort: "desc",
      width: "minmax(6ch, 1fr)",
      sticky: true
    },
    "title": {
      header: "Title",
      sort: "asc",
      width: "2fr",
      link: item => { return { route: `/races/${item.raceId}?year=${item.year}`, text: item.title } }
    },
    "position": {
      header: "Position",
      width: "minmax(5ch, 1fr)",
      sticky: true
    },
    "time": {
       header: "Time",
       width: "minmax(4ch, 1fr)",
       cmp: (a, b) => a.year.endsWith("*") == b.year.endsWith("*") ? a.time.localeCompare(b.time) : a.year.endsWith("*") ? 1 : -1
    },
    "category": {
      header: "Categ.",
      width: "minmax(4ch, 1fr)",
      sticky: true
    },
    "distance": {
      header: `Distance (${units.distance.unit})`,
      width: "minmax(8ch, 1fr)",
      display: item => units.distance.scale(item.distance),
      sticky: true
    },
    "climb": {
      header: `Ascent (${units.ascent.unit})`,
      display: item => units.ascent.scale(item.climb),
      width: "minmax(8ch, 1fr)",
      sticky: true
    },
    "categoryPos": {
      header: "Categ.Position",
      display: item => Object.entries(item.categoryPos).map(([k, v]) => `${k}:${v}`).join(", "),
      width: "minmax(12ch, 1fr)",
      cmp: (a, b) => compareCategoryPos(a.categoryPos, b.categoryPos)
    }
  };

  let clubs = $page.url.searchParams.getAll("club");
  let sortedStats = [] as RunnerStats[];
  let visibleResults = [] as RunnerInfo[];
  let selectedRow: RunnerInfo;
  $: {
    visibleResults = [];
    for (const r of results)
      if (clubs.length == 0 || clubs.includes(r.club))
        visibleResults.push(r);

    const stats = [];
    for (const r of visibleResults) {
      let s = stats.find(s => s.year == r.year);
      if (!s) {
        s = { year: r.year, nRaces: 0, totalDistance: 0, totalAscent: 0 };
        stats.push(s);
      }

      s.nRaces++;
      s.totalDistance += r.distance;
      s.totalAscent += r.climb;
    }

    sortedStats = stats.sort((a, b) => a.year.localeCompare(b.year));
  }
</script>
{#if visibleResults.length == 0}
  <Alert color="blue">
    Sorry, there are not enough results to display.
  </Alert>
{:else}
  <Tabs>
    <TabItem open title="Results">
      {#if uniqueClubs.size > 1}
        <Button>Select clubs<CaretDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button>
        <Dropdown>
          {#each uniqueClubs as club}
            <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
              <Checkbox bind:group={clubs} value={club}>{club}</Checkbox>
            </li>
          {/each}
        </Dropdown>
      {/if}

      <VirtualTable items={visibleResults} {columns} on:select-row={(e) => selectedRow = e.detail} />
    </TabItem>

    <TabItem title="Stats">
      <Heading tag="h3">Number of races: {visibleResults.length}</Heading>
      <Chart
        options={{
          series: [ {
            name: '#Races',
            data: sortedStats.map(s => s.nRaces)
          }],
          xaxis: { categories: sortedStats.map(s => s.year) },
          chart: {
            type: 'bar',
            width: '100%',
            height: 200
          }
        }} />

      <Heading tag="h3">Total distance: {units.distance.scale(visibleResults.reduce((soFar, r) => soFar + r.distance, 0))} {units.distance.unit}</Heading>
      <Chart
        options={{
          series: [ {
            name: `Distance (${units.distance.unit})`,
            data: sortedStats.map(s => parseInt(units.distance.scale(s.totalDistance)))
          }],
          xaxis: { categories: sortedStats.map(s => s.year) },
          chart: {
            type: 'bar',
            width: '100%',
            height: 200
          }
        }} />

      <Heading tag="h3">Total ascent: {units.ascent.scale(visibleResults.reduce((soFar, r) => soFar + r.climb, 0))} {units.ascent.unit}</Heading>
      <Chart
        options={{
          series: [ {
            name: `Ascent (${units.ascent.unit})`,
            data: sortedStats.map(s => parseInt(units.ascent.scale(s.totalAscent)))
          }],
          xaxis: { categories: sortedStats.map(s => s.year) },
          chart: {
            type: 'bar',
            width: '100%',
            height: 200
          }
        }} />
    </TabItem>
  </Tabs>
{/if}
