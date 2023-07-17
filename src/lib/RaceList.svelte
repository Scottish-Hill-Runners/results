<script lang="ts">
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { Heading, Pagination, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch } from 'flowbite-svelte';
  import { metric, imperial } from '$lib/units';
  import { makeUrl } from '$lib/makeUrl';
  import SortIcon from '$lib/SortIcon.svelte';

  export let data: RaceInfo[];

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  const sortKey = writable('title' as keyof RaceInfo); 
  const sortDirection = writable(1);

  const sortBy = (key: keyof RaceInfo) => {
    if ($sortKey === key)
      sortDirection.update(val => -val);
    else {
      sortKey.set(key);
      sortDirection.set(1);
    }
  };

  function cmp(key: keyof RaceInfo, direction: number): (a: RaceInfo, b: RaceInfo) => number {
    return (a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal == 'number' && typeof bVal == 'number')
        return (aVal - bVal) * direction;
      if (typeof aVal == 'string' && typeof bVal == 'string')
        return aVal.localeCompare(bVal, undefined, { sensitivity: 'base' }) * direction;
      return 0;
    };
  }

  let searchTerm = '';

  let pageSize = 10;
  let nPages = 1;
  let currentPage = 0;
  const previous = () => { if (currentPage > 0) currentPage--; };
  const next = () => { if (currentPage < nPages - 1) currentPage++; };

  const sortItems = writable(data.slice());
  $: {
    const compare = cmp($sortKey, $sortDirection);
    const filteredItems =
      data
        .filter(item => item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1)
        .sort(compare);
    nPages = (filteredItems.length + pageSize - 1) / pageSize << 0;
    if (currentPage > nPages - 1) currentPage = nPages - 1;
    sortItems.set(
      filteredItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize));
  }
</script>

<Heading>Scottish Hill Races</Heading>

<TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm}>
  <TableHead>
    <TableHeadCell on:click={() => sortBy('title')}>Name{#if $sortKey === 'title'}<SortIcon />{/if}</TableHeadCell>
    <TableHeadCell on:click={() => sortBy('venue')}>Venue{#if $sortKey === 'venue'}<SortIcon />{/if}</TableHeadCell>
    <TableHeadCell on:click={() => sortBy('distance')}>Distance ({units.distance.unit}){#if $sortKey === 'distance'}<SortIcon />{/if}</TableHeadCell>
    <TableHeadCell on:click={() => sortBy('climb')}>Ascent ({units.ascent.unit}){#if $sortKey === 'climb'}<SortIcon />{/if}</TableHeadCell>
  </TableHead>
  <TableBody>
    {#each $sortItems as result}
    <TableBodyRow>
      <TableBodyCell><a href={makeUrl($page.url, result.raceId)}>{result.title}</a></TableBodyCell>
      <TableBodyCell>{result.venue}</TableBodyCell>
      <TableBodyCell>{units.distance.scale(result.distance)}</TableBodyCell>
      <TableBodyCell>{units.ascent.scale(result.climb)}</TableBodyCell>
    </TableBodyRow>
    {/each}
  </TableBody>
</TableSearch>

<Pagination pages={[{ name: `page ${currentPage + 1} of ${nPages}` }]} on:previous={previous} on:next={next} />
