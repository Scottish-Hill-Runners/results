<script lang="ts">
  import { page } from '$app/stores';
  import { Pagination, Tabs, TabItem, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from 'flowbite-svelte';
  import Chart from 'svelte-frappe-charts';
  import Link from '$lib/Link.svelte';
  import SortDirection from './SortDirection.svelte';
  import { metric, imperial } from '$lib/units';

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  export let results: RunnerInfo[];
  export let stats: { year: string, nRaces: number, totalDistance: number, totalAscent: number }[];

  const sortedStats = stats.sort((a, b) => a.year.localeCompare(b.year));
  const years = sortedStats.map(s => s.year);
  let sortKey = { year: 'desc', title: 'desc' } as { [key in keyof RunnerInfo]: 'asc' | 'desc' };

  const sortBy = (key: keyof RunnerInfo) => {
    const current = sortKey[key];
    delete sortKey[key];
    if (current == undefined)
      sortKey = { [key]: 'asc', ...sortKey };
    else if (current == 'asc')
      sortKey = { [key]: 'desc', ...sortKey };
    else
      sortKey = { ...sortKey };
  };

  function compare(order: typeof sortKey): (a: RunnerInfo, b: RunnerInfo) => number {
    return (a, b) => {
      for (const [key, dir] of Object.entries(order)) {
        const aVal = a[key];
        const bVal = b[key];
        const cmp =
          typeof aVal == 'number' && typeof bVal == 'number'
          ? aVal - bVal
          : typeof aVal == 'string' && typeof bVal == 'string'
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
          : typeof aVal == 'object' && typeof bVal == 'object'
          ? Math.min(...Object.values(aVal) as number[]) - Math.min(...Object.values(aVal) as number[])
          : 0;
        if (cmp != 0)
          return cmp * (dir == 'asc' ? 1 : -1);
      }

      return 0;
    };
  }

  let searchTerm = '';

  let pageSize = 10;
  let nPages = 1;
  let currentPage = 0;
  const previous = () => { if (currentPage > 0) currentPage--; };
  const next = () => { if (currentPage < nPages - 1) currentPage++; };

  let visibleResults = [] as RunnerInfo[];
  $: {
    const lcSearch = searchTerm.toLowerCase();
    const cmp = compare(sortKey);
    const filteredItems =
      results
        .filter(item => item.title.toLowerCase().indexOf(lcSearch) !== -1)
        .sort(cmp)
    nPages = (filteredItems.length + pageSize - 1) / pageSize << 0;
    if (currentPage > nPages - 1) currentPage = nPages - 1;
    visibleResults = filteredItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  }
</script>

<Tabs>
  <TabItem open title="Results">
    <TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm}>
      <TableHead>
        <TableHeadCell on:click={() => sortBy('year')}>Year<SortDirection dir={sortKey.year} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('title')}>Title<SortDirection dir={sortKey.title} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('position')}>Position<SortDirection dir={sortKey.position} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('time')}>Time<SortDirection dir={sortKey.time} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('category')}>Category<SortDirection dir={sortKey.category} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('distance')}>Distance ({units.distance.unit})<SortDirection dir={sortKey.distance} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('climb')}>Ascent({units.ascent.unit})<SortDirection dir={sortKey.climb} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('categoryPos')}>Categ.Position<SortDirection dir={sortKey.categoryPos} /></TableHeadCell>
      </TableHead>
      <TableBody>
        {#each visibleResults as result}
          <TableBodyRow>
            <TableBodyCell>{result.year}</TableBodyCell>
            <TableBodyCell><Link route={result.raceId} text={result.title} /></TableBodyCell>
            <TableBodyCell>{result.position}</TableBodyCell>
            <TableBodyCell>{result.time}</TableBodyCell>
            <TableBodyCell>{result.category}</TableBodyCell>
            <TableBodyCell>{result.distance}</TableBodyCell>
            <TableBodyCell>{result.climb}</TableBodyCell>
            <TableBodyCell>{Object.entries(result.categoryPos).map(([k, v]) => `${k}:${v}`).join(", ")}</TableBodyCell>
          </TableBodyRow>
          {/each}
      </TableBody>
    </TableSearch>
    <Pagination pages={[{ name: `page ${currentPage + 1} of ${nPages}` }]} on:previous={previous} on:next={next} />
  </TabItem>

  <TabItem title="Stats">
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
  </TabItem>
</Tabs>

