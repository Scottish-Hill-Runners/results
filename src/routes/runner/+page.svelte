<script lang="ts">
  /** @type {import('./$types').PageData} */
  import { page } from '$app/stores';
  import RunnerResults from '$lib/RunnerResults.svelte';
  export let data: { blocks: Block[], races: RaceInfo[] };

  function raceInfo(raceId: string): RaceInfo {
    return data.races.find(r => r.raceId == raceId);
  }

  const name = $page.url.searchParams.get("name");
  const results = [] as RunnerInfo[];
  // TODO: gather some statistics
  //   - year x number of races
  data.blocks.forEach(blocks =>
   Object.values(blocks).forEach(race =>
    race.forEach(r => {
    if (r.name == name) {
      const info = raceInfo(r.raceId);
      results.push({
          raceId: r.raceId,
          title: info?.title,
          year: r.year,
          time: r.time,
          position: r.position,
          category: r.category,
          categoryPos: r.categoryPos,
          distance: info?.distance ?? 0,
          climb: info?.climb
        });
      }
    })));
</script>

<h1>Results for {$page.url.searchParams.get("name")}</h1>

<RunnerResults {results} />
