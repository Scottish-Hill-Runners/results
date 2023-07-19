<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Heading, Pagination, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch, Tooltip } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import { metric, imperial } from '$lib/units';
  import Link from './Link.svelte';
  import SortDirection from '$lib/SortDirection.svelte';

  export let data: RaceInfo[];

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  let sortKey = { title: 'asc' } as { [key in keyof RaceInfo]: 'asc' | 'desc' };

  const sortBy = (key: keyof RaceInfo) => {
    const current = sortKey[key];
    delete sortKey[key];
    if (current == undefined)
      sortKey = { [key]: 'asc', ...sortKey };
    else if (current == 'asc')
      sortKey = { [key]: 'desc', ...sortKey };
    else
      sortKey = { ...sortKey };
  };

  function compare(order: typeof sortKey): (a: RaceInfo, b: RaceInfo) => number {
    return (a, b) => {
      for (const [key, dir] of Object.entries(order)) {
        const aVal = a[key];
        const bVal = b[key];
        const cmp =
          typeof aVal == 'number' && typeof bVal == 'number'
          ? aVal - bVal
          : typeof aVal == 'string' && typeof bVal == 'string'
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
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

  let sortItems = [] as RaceInfo[];
  $: {
    const cmp = compare(sortKey);
    const filteredItems =
      data
        .filter(item => item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
        .sort(cmp);
    nPages = (filteredItems.length + pageSize - 1) / pageSize << 0;
    currentPage = Math.max(0, Math.min(currentPage, nPages - 1));
    sortItems = filteredItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  }
</script>

<Heading>Scottish Hill Races</Heading>

<Button
  color="light"
  size="xs"
  href={`https://github.com/Scottish-Hill-Runners/results/new/main/races`}><GithubSolid />&nbsp;Add new race</Button>
<Tooltip>Under 'Name your file', enter a new or unused race number (in the format RA-xxxx), followed by '/index.md'</Tooltip>

<TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm}>
  <TableHead>
    <TableHeadCell on:click={() => sortBy('title')}>Name<SortDirection dir={sortKey.title} /></TableHeadCell>
    <TableHeadCell on:click={() => sortBy('venue')}>Venue<SortDirection dir={sortKey.venue} /></TableHeadCell>
    <TableHeadCell on:click={() => sortBy('distance')}>Distance ({units.distance.unit})<SortDirection dir={sortKey.distance} /></TableHeadCell>
    <TableHeadCell on:click={() => sortBy('climb')}>Ascent ({units.ascent.unit})<SortDirection dir={sortKey.climb} /></TableHeadCell>
  </TableHead>
  <TableBody>
    {#each sortItems as result}
    <TableBodyRow>
      <TableBodyCell><Link route={result.raceId} text={result.title} /></TableBodyCell>
      <TableBodyCell>{result.venue}</TableBodyCell>
      <TableBodyCell>{units.distance.scale(result.distance)}</TableBodyCell>
      <TableBodyCell>{units.ascent.scale(result.climb)}</TableBodyCell>
    </TableBodyRow>
    {/each}
  </TableBody>
</TableSearch>

<Pagination pages={[{ name: `page ${currentPage + 1} of ${nPages}` }]} on:previous={previous} on:next={next} />
