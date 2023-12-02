import csv from "csvtojson";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import MarkdownIt from "markdown-it";

function progress(message: string): void {
  process.stdout.write(`\x1b[K${message}\r`);
}

function formatTime(time: string): string {
  const match = time.match(/(\d?\d)[:h](\d\d)(?:[m:\.](\d\d))?/);
  if (match)
    return `${(match[1].length == 1 ? '0' : '') + match[1]}:${match[2]}:${match[3] ?? '00'}`;
  return time;
}

async function readRaceInstance(raceId: string, raceInstancePath: string): Promise<Result[]> {
  return await csv().fromFile(raceInstancePath).then(jsonArray => {
    type PosByCategory = { [cat: string]: number }
    const posByCategory = {} as PosByCategory;
    // TODO: handle dead heats
    const updateCategoryPos = (category: string) => {
      // Ignore V(=vet), U(=under-23?), J(=junior), (S=senior) attributions.
      const groups = category.replace(/[VUJS]/, '').match(/([^\d]*)(\d+)?/);
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

    progress(`Processing results from ${raceInstancePath}`)
    return jsonArray.map(json => {
      const category = ((json.RunnerCategory ?? json.Category ?? json.Cat ?? "") as string).toUpperCase();
      return {
        raceId: raceId,
        year: path.basename(raceInstancePath, ".csv"),
        position: parseInt(json.RunnerPosition ?? json.FinishPosition ?? json.Position ?? json.Pos),
        name: json.Name ?? `${json.Firstname ?? ''} ${json.Surname ?? ''}`,
        club: json.Club as string, // TODO: Normalise using club aliases
        category: category,
        categoryPos: updateCategoryPos(category),
        time: formatTime((json.FinishTime ?? json.Time) as string)
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

const allResults = await readResults();
const byRaceId = groupBy(allResults, r => r.raceId);

const md = new MarkdownIt();
const raceBlocks = [] as { raceId: string, blockId: number}[];
const runnerBlocks = {} as { [name: string]: { blocks: number[], nRaces: number } };
  
function writeBlock(block: Block): number {
  const blockId = raceBlocks.length;
  progress(`Writing result chunk ${blockId}`)
  fs.writeFileSync(`static/data/${blockId}.json`, JSON.stringify(block));
  Object.keys(block).forEach(raceId => {
    raceBlocks.push({ raceId, blockId });
    block[raceId].forEach(r => {
      if (!runnerBlocks[r.name])
        runnerBlocks[r.name] = { blocks: [], nRaces: 0 };
      runnerBlocks[r.name].nRaces++;
      if (!runnerBlocks[r.name].blocks.includes(blockId))
        runnerBlocks[r.name].blocks.push(blockId)
    });
  });
  return blockId;
}

function writeBlocks() {
  fs.mkdirSync(`static/data`, { recursive: true });
  fs.mkdirSync(`static/gpx`, { recursive: true });

  const allYears = new Map<string, number[]>();
  const yearInfo: YearInfo[] = [];
  groupBy(allResults, r => r.year.substring(0, 4)).forEach((results, year) => {
    const uniqueRaces = new Set<string>();
    const uniqueClubs = new Set<string>();
    const uniqueRunners = new Map<string, Set<string>>();
    for (const r of results) {
      uniqueRaces.add(r.raceId);
      uniqueClubs.add(r.club);
      if (!uniqueRunners.has(r.category))
        uniqueRunners.set(r.category, new Set<string>());
      uniqueRunners.get(r.category).add(r.name);
    }

    const nRunners: { [cat: string]: number } = {};
    for (const [cat, names] of uniqueRunners)
      nRunners[cat] = names.size;
    yearInfo.push( {
      year,
      nRaces: uniqueRaces.size,
      nClubs: uniqueClubs.size,
      nResults: results.length,
      nRunners
    });
    allYears.set(year, []);
    let currentBlock = {} as Block;
    let currentBlockSize = 0;
    groupBy(results, r => r.raceId).forEach((results, raceId) => {
      currentBlock[raceId] = results;
      currentBlockSize += results.length;
      if (currentBlockSize > 1000) {
        allYears.get(year).push(writeBlock(currentBlock));
        currentBlock = {};
        currentBlockSize = 0;
      }
    });
    if (currentBlockSize > 0)
      allYears.get(year).push(writeBlock(currentBlock));

    fs.mkdirSync(`src/routes/year/${year}`, { recursive: true });
    fs.writeFileSync(
      `src/routes/year/${year}/+page.ts`,
      `/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  return {
    results: await Promise.all([${
      allYears.get(year).map(blockId =>`
        fetch("/data/${blockId}.json")
          .then(resp => resp.json() as Promise<Block>)`)}]),
    races: await fetch("/data/races.json").then(resp => resp.json() as Promise<RaceInfo>)
  };
};
`);
fs.writeFileSync(
  `src/routes/year/${year}/+page.svelte`,
  `<script type="ts">
/** @type {import('./$types').PageData} */
import YearResults from "$lib/YearResults.svelte";
export let data;
const results = data.results.flatMap(block => Object.values(block).flat());
const races = data.races;
const year = "${year}";
</script>
<svelte:head>
<title>SHR - {year}</title>
</svelte:head>
<YearResults {results} {races} {year} />
`);
  });

  fs.writeFileSync(
    `src/routes/year/+page.svelte`,
    `<script type="ts">
  /** @type {import('./$types').PageData} */
  import YearList from "$lib/YearList.svelte";
  const yearInfo = ${JSON.stringify(yearInfo)};
</script>

<svelte:head>
  <title>SHR - Years</title>
</svelte:head>

<YearList {yearInfo} />
`);

  const runnerData = {} as RunnerData;
  Object.entries(runnerBlocks).forEach(([name, r]) => { if (r.nRaces > 1) runnerData[name] = r.blocks });
  fs.writeFileSync('static/data/runners.json', JSON.stringify(runnerData));

  const encoder = new TextEncoder();
  fs.mkdirSync("static/gpx", { recursive: true });
  const raceInfo = [] as RaceInfo[];
  groupBy(raceBlocks, r => r.raceId).forEach((blocks, raceId) => {
    const results = byRaceId.get(raceId);
    if (!results) return;
    fs.mkdirSync(`src/routes/races/${raceId}`, { recursive: true });
    const hasGpx = fs.existsSync(`races/${raceId}/route.gpx`);
    if (hasGpx)
      fs.copyFileSync(`races/${raceId}/route.gpx`, `static/gpx/${raceId}.gpx`)

    const {data, content} = matter.read(`races/${raceId}/index.md`);
    const info = {
      raceId: raceId,
      title: data.title,
      venue: data.venue,
      distance: parseFloat(data.distance),
      climb: parseFloat(data.climb),
      maleRecord: data.maleRecord ?? data.record,
      femaleRecord: data.femaleRecord,
      nonBinaryRecord: data.nonBinaryRecord,
      web: data.web,
      organiser: data.organiser ? Array.from(encoder.encode(data.organiser)) : null
    };
    raceInfo.push(info);

    progress(`Writing races/${raceId}/+page.ts`);
    fs.writeFileSync(
        `src/routes/races/${raceId}/+page.ts`,
        `/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  return {
    races: await fetch("/data/races.json")
      .then(resp => resp.json() as Promise<RaceInfo[]>),
    results: await Promise.all([${
      blocks
        .map(block =>`
fetch("/data/${block.blockId}.json")
  .then(resp => resp.json() as Promise<Block>)
  .then(block => block['${block.raceId}'])`)
        .join(',')}])
    };
}
`);
      fs.writeFileSync(
        `src/routes/races/${raceId}/+page.svelte`,
        `<script type="ts">
  /** @type {import('./$types').PageData} */
  import RaceResults from "$lib/RaceResults.svelte";
  export let data;
  const results = data.results.flat();
  const info = data.races.find(r => r.raceId == "${raceId}");
  const blurb = ${JSON.stringify(md.render(content))};
  const hasGpx = ${hasGpx};
</script>
<svelte:head>
  <title>SHR - ${info.title}</title>
</svelte:head>
<RaceResults {results} {info} {blurb} {hasGpx} />
`);
  });

  fs.writeFileSync(`static/data/races.json`, JSON.stringify(raceInfo));
  fs.mkdirSync(`src/routes/races`, { recursive: true });
  fs.writeFileSync(
    `src/routes/races/+page.ts`,
    `/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  return { results:
    await fetch("/data/races.json")
      .then(resp => resp.json() as Promise<RaceInfo[]>)
  };
}
`);
  fs.writeFileSync(
    `src/routes/races/+page.svelte`,
    `<script type="ts">
  /** @type {import('./$types').PageData} */
  import RaceList from "$lib/RaceList.svelte";
  export let data;
</script>

<svelte:head>
  <title>SHR - Races</title>
</svelte:head>

<RaceList data={data.results} />
`);
  progress("Done\n")
}

writeBlocks()
