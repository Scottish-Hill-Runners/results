import csv from "csvtojson";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

async function readRaceInstance(raceId: string, raceInstancePath: string): Promise<Result[]> {
  return await csv().fromFile(raceInstancePath).then(jsonArray => {
    type PosByCategory = { [cat: string]: number }
    const posByCategory = {} as PosByCategory;
    const updateCategoryPos = (category: string) => {
      // Ignore V(=vet), U(=under-23?), J(=junior) attributions.
      const groups = category.replace(/[VUJ]/, '').match(/([^\d]*)(\d+)?/);
      const s = groups?.[1]?.replace(/[WL]/, 'F') ?? 'M'; // W=Women, L=Lady.
      const sex = s.length == 0 ? 'M' : s;
      const age = Math.max(parseInt(groups?.[2]?.substring(0, 1) ?? '3') * 10, 30);
      const catPos = {} as PosByCategory;
      for (let a = 30; a <= age; a += 10) {
        const cat = sex + (a < 40 ? '' : a);
        catPos[cat] = posByCategory[cat] = (posByCategory?.[cat] ?? 0) + 1;
      }
    
      return catPos;
    };

    return jsonArray.map(json => {
      const category = (json.RunnerCategory as string).toUpperCase();
      return {
        raceId: raceId,
        year: path.basename(raceInstancePath, ".csv"),
        position: parseInt(json.RunnerPosition || json.FinishPosition),
        surname: json.Surname as string,
        forename: json.Firstname as string,
        club: json.Club as string, // *** Need to map to a ClubId.
        category: category,
        categoryPos: updateCategoryPos(category),
        time: json.FinishTime as string
      };
    })
  });
}

async function readRaceResults(raceId: string): Promise<Result[]> {
  return await Promise.all(
    fs.readdirSync(raceId, { withFileTypes: true })
      .flatMap(raceInstance => {
        if (!raceInstance.isFile() || path.extname(raceInstance.name) != ".csv")
          return Promise.resolve([] as Result[]);
        return readRaceInstance(path.basename(raceId), `${raceId}/${raceInstance.name}`);
      }))
    .then(results => results.flat());
}

async function readResults(): Promise<Result[]> {
  return await Promise.all(
    fs.readdirSync("races", { withFileTypes: true })
      .flatMap(raceId => {
        if (!raceId.isDirectory())
          return Promise.resolve([] as Result[]);
        return readRaceResults(`races/${raceId.name}`);
      }))
    .then(result => result.flat());
}

function groupBy<K, V>(data: V[], key: (t: V) => K): Map<K, V[]> {
  const result = new Map<K, V[]>();
  data.forEach(value => {
    const k = key(value);
    const ts = result.get(k);
    if (ts === undefined)
      result.set(k, [value]);
    else
      return ts.push(value);
  });
  return result;
}

function raceStats(results: Result[]): RaceStats {
  const stats = {} as RaceStats;
  results.forEach(r => {
    let byYear = stats[r.year];
    if (byYear === undefined) {
      byYear = {};
      stats[r.year] = byYear;
    }

    const tally = byYear[r.category] ?? 0;
    byYear[r.category] = tally + 1;
  });
  return stats;
}

const md = new MarkdownIt();

function writeRaceResults(results: Result[], raceId: string): RaceInfo {
  fs.mkdirSync(`static/results`, { recursive: true });
  fs.writeFileSync(`static/results/${raceId}.json`, JSON.stringify(results));
  const stats = raceStats(results);
  fs.mkdirSync(`src/routes/${raceId}`, { recursive: true });
  const {data, content} = matter.read(`races/${raceId}/index.md`);
  fs.writeFileSync(
    `src/routes/${raceId}/+page.svelte`,
    `<script>
  import RaceResults from "$lib/RaceResults.svelte";
  async function loadResults() {
    const response = await fetch("/results/${raceId}.json");
    return await response.json();
  }
  const promise = loadResults();
  const title = ${JSON.stringify(data.title)};
  const blurb = ${JSON.stringify(md.render(content))};
  const record = ${JSON.stringify(data.record)};
  const femaleRecord = ${JSON.stringify(data.femaleRecord)};
  const stats = ${JSON.stringify(stats)};
</script>
{#await promise}
	<p>Loading...</p>
{:then results}
<RaceResults
  results={results}
  title={title}
  blurb={blurb}
  record={record}
  femaleRecord={femaleRecord}
  stats={stats} />
{/await}
`);
  return {
    raceId: raceId,
    title: data.title,
    venue: data.venue,
    distance: parseFloat(data.distance),
    climb: parseFloat(data.climb),
    record: data.record,
    femaleRecord: data.femaleRecord
  };
}

const allResults = await readResults();
const raceInfo = [] as RaceInfo[];
groupBy(allResults, r => r.raceId).forEach((results, raceId) => {
  raceInfo.push(writeRaceResults(results, raceId));
});

raceInfo.sort((a: RaceInfo, b: RaceInfo) => a.title > b.title ? 1 : -1)
fs.mkdirSync(`src/routes/races`, { recursive: true });
fs.writeFileSync(
  `src/routes/races/+page.svelte`,
  `<script>
import RaceList from "$lib/RaceList.svelte";
const data = ${JSON.stringify(raceInfo)};
</script>
<RaceList data={data} />
`);
