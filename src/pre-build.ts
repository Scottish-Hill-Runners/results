import csv from "csvtojson";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";

async function readRaceInstance(raceId: string, raceInstancePath: string): Promise<Result[]> {
  return await csv().fromFile(raceInstancePath).then(jsonArray =>
    jsonArray.map(json => {
      return {
        raceId: raceId,
        year: path.basename(raceInstancePath, ".csv"),
        position: parseInt(json.RunnerPosition || json.FinishPosition),
        surname: json.Surname as string,
        forename: json.Firstname as string,
        club: json.Club as string, // *** Needs to be a ClubId.
        category: json.RunnerCategory as string,
        time: json.FinishTime as string
      };
    }));
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
  const stats = raceStats(results);
  fs.mkdirSync(`src/routes/${raceId}`, { recursive: true });
  const {data, content} = matter.read(`races/${raceId}/index.md`);
  fs.writeFileSync(
    `src/routes/${raceId}/+page.svelte`,
    `<script>
  import RaceResults from "$lib/RaceResults.svelte";
  const results = ${JSON.stringify(results)};
  const title = ${JSON.stringify(data.title)};
  const blurb = ${JSON.stringify(md.render(content))};
  const record = ${JSON.stringify(data.record)};
  const femaleRecord = ${JSON.stringify(data.femaleRecord)};
  const stats = ${JSON.stringify(stats)};
</script>
<RaceResults
  results={results}
  title={title}
  blurb={blurb}
  record={record}
  femaleRecord={femaleRecord}
  stats={stats} />
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
