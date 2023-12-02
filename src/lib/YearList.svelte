<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import VirtualTable from './VirtualTable.svelte';

  export let yearInfo: YearInfo[];

  const columns: { [key: string]: ColumnSpec<YearInfo> } = {
    "year": {
      header: "Year",
      sort: "desc",
      width: "1fr",
      link: (item) => { return { route: `/year/${item.year}`, text: item.year } }
    },
    "nRaces": { header: "Races", width: "1fr" },
    "nClubs": { header: "Clubs", width: "1fr" },
    "nResults": { header: "Entries", width: "1fr" },
    "nRunners": {
      header: "Runners",
      display: item => Object.values(item.nRunners).reduce((a, b) => a + b, 0)
    }
  };

  let search = "";
  let items = yearInfo;
  $: {
    if (search.length == 0)
    items = yearInfo;
    else {
      const lcSearch = search.toLowerCase();
      items = yearInfo.filter(r => r.year.toLowerCase().indexOf(lcSearch) != -1);
    }
  }
</script>

<Heading>Scottish Hill Runners - results by year</Heading>

<VirtualTable {items} {columns} />
