<script lang="ts">
  /** @type {import('./$types').PageData} */
  import { page } from '$app/stores';
  import RunnerResults from '$lib/RunnerResults.svelte';
  export let data: { blocks: Block[], runnerData: RunnerData, races: RaceInfo[] };

  function raceInfo(raceId: string): RaceInfo {
    return data.races.find(r => r.raceId == raceId);
  }

  // TODO: extend params to include multiple clubs, aliases
  let name = $page.url.searchParams.get("name");
  let club = $page.url.searchParams.get("club");

  const results = [] as RunnerInfo[];
  const stats = [] as RunnerStats[];
  data.blocks.forEach(blocks =>
   Object.values(blocks).forEach(race =>
    race.forEach(r => {
    if (r.name == name && (!club || r.club == club)) {
      const info = raceInfo(r.raceId);
      let s = stats.find(s => s.year == r.year);
      if (!s) {
        s = { year: r.year, nRaces: 0, totalDistance: 0, totalAscent: 0 };
        stats.push(s);
      }

      s.nRaces++;
      s.totalDistance += info.distance;
      s.totalAscent += info?.climb ?? 0;
      results.push({
          raceId: r.raceId,
          title: info?.title,
          year: r.year,
          time: r.time,
          position: r.position,
          category: r.category,
          categoryPos: r.categoryPos,
          distance: info?.distance,
          climb: info?.climb ?? 0
        });
      }
    })));
</script>

<h1>Results for {name}{#if club}&nbsp;({club}){/if}</h1>

<RunnerResults {results} {stats} />
