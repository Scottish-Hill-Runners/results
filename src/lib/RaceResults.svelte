<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ButtonGroup, Checkbox, Chevron, Dropdown, DropdownItem, Heading, Hr, P, Popover, Search, Tabs, TabItem, A } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import Chart from 'svelte-frappe-charts';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from '$lib/VirtualTable.svelte';

  export let results: Result[];
  export let info: RaceInfo;
  export let blurb: string;
  export let stats: RaceStats;
  export let hasGpx: boolean;

  const gpxViewer = hasGpx ? new URL("https://gpsvisualizer.com/atlas/map") : null;
  gpxViewer?.searchParams.append("url", new URL(`/gpx/${info.raceId}.gpx`, $page.url.href).toString());

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  // See https://stackoverflow.com/a/201378/11340761
  const emailRex = /\s*<((?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\]))>/gi;
  const organiserEmails = Array.from((info.organiser ?? "").matchAll(emailRex)).map(v => encodeURIComponent(v[1]));
  const organisers = info.organiser?.replaceAll(emailRex, "");

  function emailOrganisers(e: MouseEvent) {
    e.preventDefault();
    const url = new URL(`mailto:${organiserEmails.join(",")}`)
    url.searchParams.append("subject", `Enquiry regarding ${info.title}`)
    window.open(url);
  }

  const uniqueCategories = new Set<string>();
  const uniqueClubs = new Set<string>();
  for (const r of results) {
    for (const cat of Object.keys(r.categoryPos))
      uniqueCategories.add(cat)
      uniqueClubs.add(r.club);
  }

  const allYears = Object.keys(stats).sort().reverse();
  const allCategories = [...uniqueCategories].sort();
  const allClubs = [...uniqueClubs].sort();

  let category = 'All';
  let year = 'All';
  let clubs: string[] = [];
  let items = results;
  let clubSearch = "";

  $: {
    items = results.filter(r =>
      (category == 'All' || r.categoryPos[category]) &&
      (year == 'All' || r.year == year) &&
      (clubs.length == 0 || clubs.includes(r.club)))
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
      link: (item) => { return { route: "/runner", params: { name: item.name, club: item.club }, text: item.name } },
      searchable: true
    },
    "club": {
      header: "Club",
      width: "minmax(6ch, 2fr)",
      sticky: true,
      searchable: true
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
            <!-- svelte-ignore a11y-invalid-attribute -->
            <A href="#" on:click={emailOrganisers}>(email)</A>
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
    <ButtonGroup>
      <Button><Chevron>Year: {year}</Chevron></Button>
      <Dropdown bind:open={yearOpen}>
        {#each ['All', ...allYears] as year}
          <DropdownItem on:click={() => changeYear(year)}>{year}</DropdownItem>
        {/each}
      </Dropdown>
      
      <Button><Chevron>Category: {category}</Chevron></Button>
      <Dropdown bind:open={categoryOpen}>
        {#each ['All', ...allCategories] as cat}
          <DropdownItem on:click={() => changeCategory(cat)}>{cat}</DropdownItem>
        {/each}
      </Dropdown>

      <Button><Chevron>Club{clubs.length == 0 ? ": All" : ""}</Chevron></Button>
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

      {#if year == 'All'}
        <Button id="edit"><GithubSolid />&nbsp;Edit results</Button>
        <Popover class="text-sm font-light" title="Add new results, or fix an error." triggeredBy="#edit" trigger="hover">
          <P>
            Select a year to edit, or
              <Button size="xs" href={`https://github.com/Scottish-Hill-Runners/results/new/main/races/${info.raceId}/`}>
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
    </ButtonGroup>
    
    <VirtualTable {items} {columns} />
  </TabItem>

  <TabItem title="Stats">
    <Chart
      title="Number of runners (by category)"
      data={{
        labels: allYears,
        datasets: allCategories.map((cat) => { return { name: cat, values: allYears.map(year => stats[year][cat]) } })
      }}
      type="bar"
      barOptions={{ stacked: 1}} />
  </TabItem>
</Tabs>

<style>
  .hidden { display: none }
</style>