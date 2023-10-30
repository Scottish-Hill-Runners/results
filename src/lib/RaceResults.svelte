<script lang="ts">
  import { page } from '$app/stores';
  import { Button, Chart, Checkbox, Dropdown, DropdownItem, Heading, Hr, Input, P, Popover, Search, Tabs, TabItem, A } from 'flowbite-svelte';
  import { ChevronDownSolid, GithubSolid } from 'flowbite-svelte-icons';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from '$lib/VirtualTable.svelte';

  export let results: Result[];
  export let info: RaceInfo;
  export let blurb: string;
  export let hasGpx: boolean;

  const gpxViewer = hasGpx ? new URL("https://gpsvisualizer.com/atlas/map") : null;
  gpxViewer?.searchParams.append("url", new URL(`/gpx/${info.raceId}.gpx`, $page.url.href).toString());

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  // See https://stackoverflow.com/a/201378/11340761
  const emailRex = /\s*<((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(?:2(?:5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>/gi;
  const organiser = info.organiser ? new TextDecoder().decode(Uint8Array.from(info.organiser)) : "";
  const organiserEmails = Array.from(organiser.matchAll(emailRex)).map(v => encodeURIComponent(v[1]));
  const organisers = organiser.replaceAll(emailRex, "");

  function emailOrganisers(e: MouseEvent) {
    e.preventDefault();
    const url = new URL(`mailto:${organiserEmails.join(",")}`)
    url.searchParams.append("subject", `Enquiry regarding ${info.title}`)
    window.open(url);
  }

  const uniqueCategories = new Set<string>();
  const uniqueClubs = new Set<string>();
  const uniqueYears = new Set<string>();
  for (const r of results) {
    for (const cat of Object.keys(r.categoryPos))
      uniqueCategories.add(cat)
      uniqueClubs.add(r.club);
      uniqueYears.add(r.year);
  }

  const allCategories = [...uniqueCategories].sort();
  const allClubs = [...uniqueClubs].sort();
  const allYears = [...uniqueYears].sort();

  let category = $page.url.searchParams.get("category") ?? 'All';
  let year = $page.url.searchParams.get("year") ?? 'All';
  let clubs: string[] = [];
  let items = results;
  let clubSearch = "";
  let nameSearch = "";
  let stats = {} as RaceStats;

  $: {
    const lcSearch = nameSearch.toLowerCase();
    items = results.filter(r =>
      (category == 'All' || r.categoryPos[category]) &&
      (year == 'All' || r.year == year) &&
      (clubs.length == 0 || clubs.includes(r.club)) &&
      r.name.toLowerCase().indexOf(lcSearch) != -1);

    stats = {};
    for (const r of items) {
      let byYear = stats[r.year];
      if (byYear === undefined) {
        byYear = {};
        stats[r.year] = byYear;
      }

      const tally = byYear[r.category] ?? 0;
      byYear[r.category] = tally + 1;
    }
  }

  let yearOpen = false;
  function changeYear(y: string) {
    year = y;
    yearOpen = false;
  }

  let categoryOpen = false;
  function changeCategory(cat: string) {
    category = cat;
    categoryOpen = false;
  }

  let clubsOpen = false;
  function clearClubs() {
    clubs = [];
    clubSearch = "";
    clubsOpen = false;
  }

  const columns: { [key: string]: ColumnSpec<Result> } = {
    "year": {
      header: "Year",
      sort: "desc",
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
    }
  };
</script>

<Heading>{info.title}</Heading>

<Heading tag="h3">{info.venue},
  distance: {units.distance.scale(info.distance)} {units.distance.unit}{#if info.climb},
  climb: {units.ascent.scale(info.climb)} {units.ascent.unit}{/if}
</Heading>

<Tabs>
  <TabItem title="About">
    <article class="prose prose-slate">
      <div class='recordHolders'>
      {#if info.maleRecord}
        <div class='recordHolder'><b>Male record:</b> {info.maleRecord}</div>
      {/if}
      {#if info.femaleRecord}
        <div class='recordHolder'><b>Female record:</b> {info.femaleRecord}</div>
      {/if}
      {#if info.nonBinaryRecord}
        <div class='recordHolder'><b>Non-binary record:</b> {info.nonBinaryRecord}</div>
      {/if}
      </div>

      {@html blurb}

      {#if organisers}
        <P>Organiser: {organisers}
          {#if organiserEmails}
            <A href="#" on:click={emailOrganisers}>(send email)</A>
          {/if}
        </P>
      {/if}
      {#if info.web}
        <P>Race web site: <A href={info.web}>{info.web}</A></P>
      {/if}
      <Hr />
      <Button
        color="light"
        size="xs"
        href={`https://github.com/Scottish-Hill-Runners/results/edit/main/races/${info.raceId}/index.md`}>
        <GithubSolid />&nbsp;Edit on GitHub
      </Button>
    </article>
  </TabItem>

  {#if gpxViewer}
    <TabItem title="Route">
      <iframe
        title="Race route"
        width="600"
        height="600"
        src={gpxViewer.toString()} />
    </TabItem>  
  {/if}

  <TabItem open title="Results">
    <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center md:space-x-3 flex-shrink-0">
      <Button>Year: {year}<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button>
      <Dropdown bind:open={yearOpen}>
        {#each ['All', ...allYears] as year}
          <DropdownItem on:click={() => changeYear(year)}>{year}</DropdownItem>
        {/each}
      </Dropdown>
      
      <Button>Category: {category}<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button>
      <Dropdown bind:open={categoryOpen}>
        {#each ['All', ...allCategories] as cat}
          <DropdownItem on:click={() => changeCategory(cat)}>{cat}</DropdownItem>
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

      {#if year == 'All'}
        <Button id="edit" color="light"><GithubSolid />&nbsp;Edit results</Button>
        <Popover class="text-sm font-light z-50" title="Add new results, or fix an error." triggeredBy="#edit" trigger="hover">
          <P>
            Select a year to edit, or
              <Button size="xs" color="light" href={`https://github.com/Scottish-Hill-Runners/results/new/main/races/${info.raceId}/`}>
                add new results
              </Button>.
              You will need to have a (free) Github account
              (<a href="https://github.com/signup" target="_blank">https://github.com/signup</a>).
          </P>
          <div class="grid md:grid-cols-6">
            {#each allYears as year}
              <Button
                color="light"
                size="xs"
                href={`https://github.com/Scottish-Hill-Runners/results/edit/main/races/${info.raceId}/${year}.csv`}>
                {year}
              </Button>
            {/each}
          </div>
          <P>
            Prepare the results in a CSV file.<br/>
            The columns should be "RunnerPosition,Surname,Firstname,Club,RunnerCategory,FinishTime".<br/>
            You can use "Name" instead of "Surname,Forename" if you prefer.<br/>
            The name of the file you create in Github must be in the format yyyy.csv.
          </P>
        </Popover>
      {:else}
        <Button
          color="light"
          size="xs"
          href={`https://github.com/Scottish-Hill-Runners/results/edit/main/races/${info.raceId}/${year}.csv`}>
          <GithubSolid />&nbsp;Edit results for {year}
        </Button>
      {/if}
      </div>

    <VirtualTable {items} {columns} />
  </TabItem>

  <TabItem title="Stats">
    <Heading tag="h3">Number of runners (by category)</Heading>
    <Chart
      options={
        {
          series: allCategories.map((cat) => { return { name: cat, data: [...Object.keys(stats)].sort().map(year => stats[year][cat]) } }),
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
