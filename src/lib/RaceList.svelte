<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Heading, Tooltip } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from './VirtualTable.svelte';

  export let data: RaceInfo[];

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;
  const columns: { [key: string]: ColumnSpec<RaceInfo> } = {
    "title": {
      header: "Title",
      sort: "asc",
      width: "1fr",
      link: (item) => { return { route: `/races/${item.raceId}`, text: item.title } },
      searchable: true
    },
    "venue": { header: "Venue", width: "1fr", searchable: true },
    "distance": {
      header: `Distance (${units.distance.unit})`,
      display: (item) => units.distance.scale(item.distance)
    },
    "climb": {
      header: `Ascent (${units.ascent.unit})`,
      display: (item) => units.ascent.scale(item.climb)
    }
  };
</script>

<Heading>Scottish Hill Races</Heading>

<Button
  color="light"
  size="xs"
  href={`https://github.com/Scottish-Hill-Runners/results/new/main/races`}><GithubSolid />&nbsp;Add new race</Button>
<Tooltip>Under 'Name your file', enter a new or unused race number (in the format RA-xxxx), followed by '/index.md'</Tooltip>

<VirtualTable items={data} {columns} />
