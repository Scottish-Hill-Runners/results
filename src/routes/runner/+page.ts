/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  const name = url.searchParams.get("name")
  return {
    blocks:
      await
        fetch("/data/runners.json")
          .then(resp => resp.json() as Promise<RunnerData>)
          .then(runnerData => {
            const blocks = runnerData?.[name] ?? [];
            return Promise.all(
              blocks.map((b) =>
                fetch(`data/${b}.json`)
                  .then(resp => resp.json() as Promise<Block>)))
      }),
    races: await fetch("/data/races.json").then(resp => resp.json() as Promise<RaceInfo>)
  };
}
