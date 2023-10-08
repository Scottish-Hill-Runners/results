<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ButtonGroup, Heading, P, Popover, Tabs, TabItem } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import Chart from 'svelte-frappe-charts';
  import { metric, imperial } from '$lib/units';
  import VirtualTable from '$lib/VirtualTable.svelte';

  export let results: Result[];
  export let info: RaceInfo;
  export let blurb: string;
  export let stats: RaceStats;

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;
  const uniqueCategories = new Set<string>();
  const allYears = Object.keys(stats).sort();
  for (const s of Object.values(stats))
    for (const c of Object.keys(s))
      uniqueCategories.add(c);
  const allCategories = Array.from(uniqueCategories).sort();

  let category = 'All';
  const resultsForCategory = { 'All': [] } as { [category: string]: Result[] };
  for (const r of results) {
    resultsForCategory['All'].push(r);
    for (const c of Object.keys(r.categoryPos)) {
      if (!resultsForCategory[c])
        resultsForCategory[c] = [];
      resultsForCategory[c].push(r);
    }
  }

  const columns: { [key: string]: ColumnSpec<Result> } = {
    "year": {
      header: "Year",
      sort: "desc",
      width: "minmax(6ch, 1fr)",
      sticky: true, 
      searchable: true
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
      link: (item) => { return { route: "runner", params: { name: item.name, club: item.club }, text: item.name } },
      searchable: true
    },
    "club": {
      header: "Club",
      width: "minmax(6ch, 2fr)",
      searchable: true,
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
  distance: {units.distance.scale(info.distance)} {units.distance.unit}{#if info.climb}, climb: {units.ascent.scale(info.climb)} {units.ascent.unit}{/if}
</Heading>

<Tabs>
  <TabItem title="About">
    <article class="prose prose-slate">
      <div class='recordHolders'>
      {#if info.record}
        <div class='recordHolder'>Male record: {info.record}</div>
      {/if}
      {#if info.femaleRecord}
        <div class='recordHolder'>Female record: {info.femaleRecord}</div>
      {/if}
      </div>

      {@html blurb}

      <Button
        color="light"
        size="xs"
        href={`https://github.com/Scottish-Hill-Runners/results/edit/main/races/${info.raceId}/index.md`}>
        <GithubSolid />&nbsp;Edit on GitHub
      </Button>
  </article>
  </TabItem>

  <TabItem open title="Results">
    <ButtonGroup>
      <Button id="category">Showing results for {category}</Button>
      <Popover class="text-sm font-light" title="Select category..." triggeredBy="#category" trigger="hover">
        <ButtonGroup id="category">
          {#each Object.keys(resultsForCategory).sort() as cat}
            <Button on:click={() => category = cat} outline={category != cat}>{cat}</Button>
          {/each}
        </ButtonGroup>
      </Popover>

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
    </ButtonGroup>
    
    <VirtualTable items={resultsForCategory[category]} {columns} />
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
