<script lang="ts">
  import { page } from '$app/stores';
  import { Button, ButtonGroup, Heading, P, Pagination, Tabs, TabItem, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell, TableSearch, Tooltip, Modal } from 'flowbite-svelte';
  import { GithubSolid } from 'flowbite-svelte-icons';
  import Chart from 'svelte-frappe-charts';
  import Link from '$lib/Link.svelte';
  import SortDirection from '$lib/SortDirection.svelte';
  import { metric, imperial } from '$lib/units';

  const units = $page.url.searchParams.get("units") == "imperial" ? imperial() : metric;

  export let results: Result[];
  export let info: RaceInfo;
  export let blurb: string;
  export let stats: RaceStats;

  const uniqueCategories = new Set<string>();
  const allYears = Object.keys(stats).sort();
  for (const s of Object.values(stats))
    for (const c of Object.keys(s))
      uniqueCategories.add(c);
  const allCategories = Array.from(uniqueCategories).sort();

  let category: string = 'All';
  const resultsForCategory = { 'All': [] } as { [category: string]: Result[] };
  for (const r of results) {
    resultsForCategory['All'].push(r);
    for (const c of Object.keys(r.categoryPos)) {
      if (!resultsForCategory[c])
        resultsForCategory[c] = [];
      resultsForCategory[c].push(r);
    }
  }

  let sortKey = { year: 'desc', position: 'asc' } as { [key in keyof Result]: 'asc' | 'desc' };

  const sortBy = (key: keyof Result) => {
    const current = sortKey[key];
    delete sortKey[key];
    if (current == undefined)
      sortKey = { [key]: 'asc', ...sortKey };
    else if (current == 'asc')
      sortKey = { [key]: 'desc', ...sortKey };
    else
      sortKey = { ...sortKey };
  };

  function compare(order: typeof sortKey): (a: Result, b: Result) => number {
    return (a, b) => {
      for (const [key, dir] of Object.entries(order)) {
        let aVal = a[key];
        let bVal = b[key];
        if (key == 'position' && category != 'All') {
          aVal = a.categoryPos[category];
          bVal = b.categoryPos[category];
        }

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

  let visibleResults = [] as Result[];
  $: {
    const lcSearch = searchTerm.toLowerCase();
    const cmp = compare(sortKey);
    const filteredItems =
      resultsForCategory[category]
        .filter(item =>
          item.name.toLowerCase().indexOf(lcSearch) !== -1
            || item.club.toLowerCase().indexOf(lcSearch) !== -1
            || item.year == lcSearch)
        .sort(cmp)
    nPages = (filteredItems.length + pageSize - 1) / pageSize << 0;
    currentPage = Math.max(0, Math.min(currentPage, nPages - 1));
    visibleResults = filteredItems.slice(currentPage * pageSize, currentPage * pageSize + pageSize);
  }

  let editModalIsOpen = false;
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
      {#each Object.keys(resultsForCategory).sort() as cat}
        <Button on:click={() => category = cat} outline={category != cat}>{cat}</Button>
      {/each}
    </ButtonGroup>

    <Button color="light" size="xs" on:click={() => editModalIsOpen = true}><GithubSolid />&nbsp;Edit results</Button>
    <Modal title="Add new results, or fix an error." bind:open={editModalIsOpen} autoclose>
      <P>Select a year to edit, or enter new results. You will need a Github account.</P>
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
      <Button
          size="xs"
          href={`https://github.com/Scottish-Hill-Runners/results/new/main/races/${info.raceId}/`}>
          Add new results
        </Button>
        <P>Prepare the results in a CSV file.<br/>
          The columns should be "RunnerPosition,Surname,Firstname,Club,RunnerCategory,FinishTime".
          You can use "Name" instead of "Surname,Forename" if you prefer.<br/>
          The name of the file you create in Github must be in the format yyyy.csv.</P>
    </Modal>

    <TableSearch placeholder="Search" hoverable={true} bind:inputValue={searchTerm}>
      <TableHead>
        <TableHeadCell on:click={() => sortBy('year')}>Year<SortDirection dir={sortKey.year} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('position')}>Position<SortDirection dir={sortKey.position} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('name')}>Name<SortDirection dir={sortKey.name} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('club')}>Club<SortDirection dir={sortKey.club} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('category')}>Category<SortDirection dir={sortKey.category} /></TableHeadCell>
        <TableHeadCell on:click={() => sortBy('time')}>Time<SortDirection dir={sortKey.time} /></TableHeadCell>
      </TableHead>
      <TableBody>
        {#each visibleResults as result}
          <TableBodyRow>
            <TableBodyCell>{result.year}</TableBodyCell>
            <TableBodyCell>{category == 'All' ? result.position : result.categoryPos[category]}</TableBodyCell>
            <TableBodyCell>
              <Link route="runner" params={{ name: result.name, club: result.club }} text={result.name} />
            </TableBodyCell>
            <TableBodyCell>{result.club}</TableBodyCell>
            <TableBodyCell>{result.category}</TableBodyCell>
            <TableBodyCell>{result.time}</TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </TableSearch>
    <Pagination pages={[{ name: `page ${currentPage + 1} of ${nPages}` }]} on:previous={previous} on:next={next} />
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
