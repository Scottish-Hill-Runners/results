<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Input, Heading, Tooltip } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from './VirtualTable.svelte';

  export let data: RaceInfo[];

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial : metric;
  const columns: { [key: string]: ColumnSpec<RaceInfo> } = {
    "title": {
      header: "Title",
      sort: "asc",
      width: "1fr",
      link: (item) => { return { route: `/races/${item.raceId}`, text: item.title } }
    },
    "venue": { header: "Venue", width: "1fr" },
    "distance": {
      header: `Distance (${units.distance.unit})`,
      display: (item) => units.distance.scale(item.distance)
    },
    "climb": {
      header: `Ascent (${units.ascent.unit})`,
      display: (item) => units.ascent.scale(item.climb)
    }
  };

  let search = "";
  let items = data;
  $: {
    if (search.length == 0)
    items = data;
    else {
      const lcSearch = search.toLowerCase();
      items = data.filter(r => r.title.toLowerCase().indexOf(lcSearch) != -1 || r.venue.toLowerCase().indexOf(lcSearch) != -1);
    }
  }
</script>

<Heading>Scottish Hill Races</Heading>

<div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center md:space-x-3 flex-shrink-0">
  <Input class="w-120" placeholder="Search" bind:value={search} />

  <Button
    color="light"
    size="xs"
    href={`https://github.com/Scottish-Hill-Runners/results/new/main/races`}><GithubSolid />&nbsp;Add new race</Button>
  <Tooltip>Under 'Name your file', enter a link name for the race (no punctuation, no spaces), followed by '/index.md'</Tooltip>
</div>

<VirtualTable {items} {columns} />
