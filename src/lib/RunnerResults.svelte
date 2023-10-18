<script lang="ts">
  import { page } from '$app/stores';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import Chart from 'svelte-frappe-charts';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from './VirtualTable.svelte';

  export let results: RunnerInfo[];
  export let stats: { year: string, nRaces: number, totalDistance: number, totalAscent: number }[];

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
      link: (item) => { return { route: `/races/${item.raceId}`, text: item.title } },
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
  const sortedStats = stats.sort((a, b) => a.year.localeCompare(b.year));
  const years = sortedStats.map(s => s.year);
</script>

<Tabs>
  <TabItem open title="Results">
    <VirtualTable items={results} {columns} />
  </TabItem>

  <TabItem title="Stats">
    <Chart
        title={`Number of races (total: ${results.length})`}
        data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.nRaces) }]}}
        type="bar" />
    <Chart
      title={`Total distance (${units.distance.scale(results.reduce((soFar, r) => soFar + r.distance, 0))} ${units.distance.unit})`}
      data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalDistance) }]}}
      type="bar" />
    <Chart 
      title={`Total ascent (${units.ascent.scale(results.reduce((soFar, r) => soFar + r.climb, 0))} ${units.ascent.unit})`}
      data={{ labels: years, datasets: [{ values: sortedStats.map(s => s.totalAscent) }]}}
      type="bar" />
  </TabItem>
</Tabs>
