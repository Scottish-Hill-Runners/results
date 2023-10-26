<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ButtonGroup, Checkbox, Chevron, Dropdown, Tabs, TabItem } from 'flowbite-svelte';
  import Chart from 'svelte-frappe-charts';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from './VirtualTable.svelte';

  export let results: RunnerInfo[];

  const possibleClubs = new Set<string>();
  for (const result of results)
    possibleClubs.add(result.club);

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;
  const columns: { [key: string]: ColumnSpec<RunnerInfo> } = {
    "year": {
      header: "Year",
      sort: "desc",
      width: "minmax(6ch, 1fr)",
      sticky: true, 
      searchable: true
    },
    "title": {
      header: "Title",
      sort: "asc",
      width: "2fr",
      link: (item) => { return { route: `/races/${item.raceId}?year=${item.year}`, text: item.title } },
      searchable: true
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
      display: (item) => units.distance.scale(item.distance),
      sticky: true
    },
    "climb": {
      header: `Ascent (${units.ascent.unit})`,
      display: (item) => units.ascent.scale(item.climb),
      width: "minmax(8ch, 1fr)",
      sticky: true
    },
    "categoryPos": {
      header: "Categ.Position",
      display: (item) => Object.entries(item.categoryPos).map(([k, v]) => `${k}:${v}`).join(", "),
      width: "minmax(12ch, 1fr)",
      cmp: (a, b) => {
        const aKeys = Object.keys(a.categoryPos);
        const bKeys = Object.keys(b.categoryPos);
        const result =
          bKeys
          .filter(k => aKeys.includes(k))
          .reduce((v, k) => v + Math.sign(a.categoryPos[k] - b.categoryPos[k]), 0);
        return result == 0 ? bKeys.length - aKeys.length : result;
      }
    }
  };

  let clubs = $page.url.searchParams.getAll("club");
  let sortedStats = [] as RunnerStats[];
  let years = [] as string[];
  let visibleResults = [] as RunnerInfo[];
  $: {
    visibleResults = [];
    for (const r of results)
      if (clubs.length == 0 || clubs.includes(r.club))
      visibleResults.push(r);

    let stats = [];
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
    years = sortedStats.map(s => s.year);
  }
</script>

<Tabs>
  <TabItem open title="Results">

  {#if possibleClubs.size > 1}
    <ButtonGroup>
      <Button><Chevron>Select clubs</Chevron></Button>
      <Dropdown>
        {#each possibleClubs as club}
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Checkbox bind:group={clubs} value={club}>{club}</Checkbox>
          </li>
        {/each}
      </Dropdown>
    </ButtonGroup>
  {/if}

    <VirtualTable items={visibleResults} {columns} />
  </TabItem>

  <TabItem title="Stats">
    <Chart
        title={`Number of races (total: ${visibleResults.length})`}
        data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.nRaces) }]}}
        type="bar" />
    <Chart
      title={`Total distance (${units.distance.scale(visibleResults.reduce((soFar, r) => soFar + r.distance, 0))} ${units.distance.unit})`}
      data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalDistance) }]}}
      type="bar" />
    <Chart 
      title={`Total ascent (${units.ascent.scale(visibleResults.reduce((soFar, r) => soFar + r.climb, 0))} ${units.ascent.unit})`}
      data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalAscent) }]}}
      type="bar" />
  </TabItem>
</Tabs>
