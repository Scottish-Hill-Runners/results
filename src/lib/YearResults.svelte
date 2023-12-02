<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Chart, Checkbox, Dropdown, DropdownItem, Heading, Input, Search, Tabs, TabItem } from 'flowbite-svelte';
  import { ChevronDownSolid } from 'flowbite-svelte-icons';
  import VirtualTable from '$lib/VirtualTable.svelte';
  import { compareCategoryPos } from './compareCategoryPos';

  export let results: Result[];
  export let races: RaceInfo[];
  export let year: string;

  const raceInfo = {} as { [raceId: string]: RaceInfo };
  for (const info of races)
    raceInfo[info.raceId] = info;

  const uniqueCategories = new Set<string>();
  const uniqueClubs = new Set<string>();
  const uniqueRaces = new Set<string>();
  for (const r of results) {
    for (const cat of Object.keys(r.categoryPos))
      uniqueCategories.add(cat);
    uniqueClubs.add(r.club);
    uniqueRaces.add(raceInfo[r.raceId].title);
  }

  const allCategories = [...uniqueCategories].sort();
  const allClubs = [...uniqueClubs].sort();
  const allRaces = [...uniqueRaces].sort();

  let category = $page.url.searchParams.get("category") ?? 'All';
  let clubs: string[] = [];
  let selectedRaces: string[] = [];
  let items = results;
  let clubSearch = "";
  let raceSearch = "";
  let nameSearch = "";
  let stats = {} as RaceStats;

  $: {
    const lcSearch = nameSearch.toLowerCase();
    items = results.filter(r =>
      (category == 'All' || r.categoryPos[category]) &&
      (clubs.length == 0 || clubs.includes(r.club)) &&
      (selectedRaces.length == 0 || selectedRaces.includes(r.raceId)) &&
      r.name.toLowerCase().indexOf(lcSearch) != -1);

    stats = {};
    for (const r of items) {
      let byRace = stats[r.raceId];
      if (byRace === undefined)
        byRace = stats[r.raceId] = {};
      byRace[r.category] = (byRace[r.category] ?? 0) + 1;
    }
  }

  let categoryOpen = false;
  function changeCategory(cat: string) {
    category = cat;
    categoryOpen = false;
  }

  let racesOpen = false;
  function clearRaces() {
    selectedRaces = [];
    raceSearch = "";
    racesOpen = false;
  }

  let clubsOpen = false;
  function clearClubs() {
    clubs = [];
    clubSearch = "";
    clubsOpen = false;
  }

  const columns: { [key: string]: ColumnSpec<Result> } = {
    "raceId": {
      header: "Race",
      display: (item) => raceInfo[item.raceId].title,
      width: "minmax(6ch, 1fr)",
      sticky: true
    },
    "position": {
      header: "Pos.",
      width: "minmax(5ch, 1fr)",
      sticky: true,
      cmp: (a, b) => category == 'All' ? a.position - b.position : a.categoryPos[category] - b.categoryPos[category],
      display: (item) => category == 'All' ? item.position : item.categoryPos[category],
      sort: "asc"
    },
    "name": {
      header: "Name",
      width: "minmax(8ch, 3fr)",
      link: (item) => { return { route: "/runner", params: { name: item.name, club: item.club }, text: item.name } }
    },
    "club": {
      header: "Club",
      width: "minmax(6ch, 2fr)",
      sticky: true
    },
    "category": {
      header: "Categ.",
      width: "minmax(4ch, 1fr)",
      sticky: true
    },
    "time": {
       header: "Time",
       width: "minmax(4ch, 1fr)",
       cmp: (a, b) => a.year.endsWith("*") == b.year.endsWith("*") ? a.time.localeCompare(b.time) : a.year.endsWith("*") ? 1 : -1
    },
    "categoryPos": {
      header: "Categ.Position",
      display: (item) => Object.entries(item.categoryPos).map(([k, v]) => `${k}:${v}`).join(", "),
      width: "minmax(12ch, 1fr)",
      ascOnly: true,
      cmp: (a, b) => compareCategoryPos(a.categoryPos, b.categoryPos)
    }
  };
</script>

<Heading>Results for {year}</Heading>

<Tabs>
  <TabItem open title="Results">
    <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center md:space-x-3 flex-shrink-0">

      <Button>Category: {category}<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button>
      <Dropdown bind:open={categoryOpen}>
        {#each ['All', ...allCategories] as cat}
          <DropdownItem on:click={() => changeCategory(cat)}>{cat}</DropdownItem>
        {/each}
      </Dropdown>

      <Button>
        Race{selectedRaces.length == 0 ? ": All" : `: ${selectedRaces[0] + (selectedRaces.length > 1 ? ` (+${selectedRaces.length - 1})` : '')}` }<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" />
    </Button>
    <Dropdown bind:open={racesOpen} class="overflow-y-auto px-3 pb-3 text-sm h-44">
      <div slot="header" class="p-3 {allRaces.length < 10 ? "hidden" : ""}">
        <Search bind:value={raceSearch} size="md" />
      </div>
      {#if selectedRaces.length > 0}
        <DropdownItem on:click={() => clearRaces()}>Clear</DropdownItem>
      {/if}
      {#each allRaces.filter(c => c.toLowerCase().indexOf(raceSearch.toLowerCase()) != -1) as race}
        <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <Checkbox bind:group={selectedRaces} value={race}>{race}</Checkbox>
        </li>
      {/each}
    </Dropdown>

      <Button>
          Club{clubs.length == 0 ? ": All" : `: ${clubs[0] + (clubs.length > 1 ? ` (+${clubs.length - 1})` : '')}` }<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" />
      </Button>
      <Dropdown bind:open={clubsOpen} class="overflow-y-auto px-3 pb-3 text-sm h-44">
        <div slot="header" class="p-3 {allClubs.length < 10 ? "hidden" : ""}">
          <Search bind:value={clubSearch} size="md" />
        </div>
        {#if clubs.length > 0}
          <DropdownItem on:click={() => clearClubs()}>Clear</DropdownItem>
        {/if}
        {#each allClubs.filter(c => c.toLowerCase().indexOf(clubSearch.toLowerCase()) != -1) as club}
          <li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
            <Checkbox bind:group={clubs} value={club}>{club}</Checkbox>
          </li>
        {/each}
      </Dropdown>

      <Input class="w-60" placeholder="Name" bind:value={nameSearch} />
    </div>

    <VirtualTable {items} {columns} />
  </TabItem>

  <TabItem title="Stats">
    <Heading tag="h3">Number of runners (by category)</Heading>
    <Chart
      options={
        {
          series: allCategories.map((cat) => { return { name: cat, data: [...Object.keys(stats)].sort().map(race => stats[race][cat]) } }),
          chart: {
            type: "bar",
            stacked: true
          }
        }
      } />
  </TabItem>
</Tabs>

<style>
  .hidden { display: none }
</style>
