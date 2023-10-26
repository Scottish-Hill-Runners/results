<script lang="ts">
  /** @type {import('./$types').PageData} */
  import { page } from '$app/stores';
  import { Heading } from 'flowbite-svelte';
  import RunnerResults from '$lib/RunnerResults.svelte';

  export let data: { blocks: Block[], runnerData: RunnerData, races: RaceInfo[] };

  const name = $page.url.searchParams.get("name");
  const results = [] as RunnerInfo[];
  for (const block of data.blocks)
    for (const race of Object.values(block))
      for (const r of race)
        if (r.name == name) {
          const info = data.races.find(race => race.raceId == r.raceId);
          results.push({
            raceId: r.raceId,
            title: info?.title,
            club: r.club,
            year: r.year.substring(0, 4),
            time: r.time,
            position: r.position,
            category: r.category,
            categoryPos: r.categoryPos,
            distance: info?.distance,
            climb: info?.climb ?? 0
          });
        }
</script>

<svelte:head>
  <title>SHR - {name}</title>
</svelte:head>

<Heading>
  Results for {name}
</Heading>

<RunnerResults {results} />
