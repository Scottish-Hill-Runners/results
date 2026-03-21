import csv from "csvtojson";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import MarkdownIt from "markdown-it";
import zlib from "zlib";

const md = new MarkdownIt();

type Result = {
  raceId: string;
  year: string;
  position: number;
  name: string;
  club: string;
  category: string;
  categoryPos: { [cat: string]: number };
  time: string;
};

type RaceInfo = {
  raceId: string;
  title: string;
  venue: string;
  distance: number;
  climb?: number;
  maleRecord?: string;
  femaleRecord?: string;
  nonBinaryRecord?: string;
  web?: string;
  organiser?: number[];
};

type YearInfo = {
  year: string;
  nRaces: number;
  nClubs: number;
  nResults: number;
  nRunners: { [cat: string]: number };
};

type ClubInfo = {
  name: string;
  aliases: string[];
  web?: string;
  contact?: string;
  info: string;
};

function progress(message: string): void {
  process.stdout.write(`\x1b[K${message}\r`);
}

function formatTime(time: string): string {
  const match = time.match(/(\d?\d)[:\.h](\d\d)(?:[:\.m](\d\d))?/i);
  if (match) {
    let hours: number, minutes: number, seconds: number;
    if (match[3]) {
      hours = parseInt(match[1]);
      minutes = parseInt(match[2]);
      seconds = parseInt(match[3]);
    } else {
      minutes = parseInt(match[1]);
      seconds = parseInt(match[2]);
      hours = Math.floor(minutes / 60);
      minutes -= hours * 60;
    }

    return (
      `${hours}`.padStart(2, "0") +
      ":" +
      `${minutes}`.padStart(2, "0") +
      ":" +
      `${seconds}`.padStart(2, "0")
    );
  }

  return "n/a"; // Compares less than any hh:mm:ss time.
}

function readClubs(dir: string): ClubInfo[] {
  const clubs = [] as ClubInfo[];
  for (const club of fs.readdirSync(dir, { withFileTypes: true }))
    if (club.isFile() || path.extname(club.name) == ".md") {
      const { data, content } = matter.read(`clubs/${club.name}`);
      clubs.push({
        name: data.name as string,
        aliases: (data.aka as string)?.split(",") ?? [],
        web: data.web as string,
        contact: data.contact as string,
        info: content,
      });
    }

  return clubs;
}

const clubs = readClubs("clubs");
const clubAliases = new Map<string, string>();
for (const club of clubs)
  for (const aka of club.aliases)
    clubAliases.set(aka.trim().toUpperCase(), club.name);

async function readRaceInstance(
  raceId: string,
  raceInstancePath: string,
): Promise<Result[]> {
  return await csv()
    .fromFile(raceInstancePath)
    .then((jsonArray) => {
      type PosByCategory = { [cat: string]: number };
      const posByCategory = {} as PosByCategory;
      // TODO: handle dead heats
      const updateCategoryPos = (category: string) => {
        const groups = category
          .replace(/\s+/g, "")
          .replace(
            /(OVER)|(OPEN)|(MEN)|(MALE)|(VET)|(SEN(IOR)?)|(JNR)|(JUN(IOR)?)|(UNDER)/gi,
            "",
          )
          .replace(/(WOMEN)|(FEMALE)|(LADY)/, "F")
          .replace(/[\WVUJS]/g, "") // Ignore V(=vet), U(=under-23?), J(=junior), (S=senior) attributions.
          .match(/([^\d]*)(\d+)?/);
        const s = groups?.[1]?.replace(/[WL]/, "F") ?? "M"; // W=Women, L=Lady.
        const sex = s.length == 0 ? "M" : s;
        const age = Math.max(
          parseInt(groups?.[2]?.substring(0, 1) ?? "3") * 10,
          30,
        );
        const catPos = {} as PosByCategory;
        for (let a = 30; a <= age; a += 10) {
          const cat = sex + (a < 40 ? "" : a);
          catPos[cat] = posByCategory[cat] = (posByCategory?.[cat] ?? 0) + 1;
        }

        return catPos;
      };

      progress(`Processing results from ${raceInstancePath}`);
      return jsonArray.map((json) => {
        const category = (
          (json.RunnerCategory ?? json.Category ?? json.Cat ?? "") as string
        )
          .trim()
          .toUpperCase();
        return {
          raceId: raceId,
          year: path.basename(raceInstancePath, ".csv"),
          position: parseInt(
            json.RunnerPosition ??
              json.FinishPosition ??
              json.Position ??
              json.Pos,
          ),
          name: (
            json.Name ?? `${json.Firstname ?? ""} ${json.Surname ?? ""}`
          ).trim(),
          club:
            clubAliases.get(json.Club?.toUpperCase() as string) ?? json.Club,
          category: category == "" ? "M" : category,
          categoryPos: updateCategoryPos(category),
          time: formatTime((json.FinishTime ?? json.Time) as string),
        };
      });
    });
}

async function readRaceResults(raceId: string): Promise<Result[]> {
  return await Promise.all(
    fs.readdirSync(raceId, { withFileTypes: true }).flatMap((raceInstance) => {
      if (!raceInstance.isFile() || path.extname(raceInstance.name) != ".csv")
        return Promise.resolve([] as Result[]);
      return readRaceInstance(
        path.basename(raceId),
        `${raceId}/${raceInstance.name}`,
      );
    }),
  ).then((results) => results.flat());
}

async function readResults(): Promise<Result[]> {
  return await Promise.all(
    fs.readdirSync("races", { withFileTypes: true }).flatMap((raceId) => {
      if (!raceId.isDirectory())
        return Promise.resolve([] as Result[]);
      return readRaceResults(`races/${raceId.name}`);
    }),
  ).then((result) => result.flat());
}

function groupBy<K, V>(data: V[], key: (t: V) => K): Map<K, V[]> {
  const result = new Map<K, V[]>();
  data.forEach((value) => {
    const k = key(value);
    const ts = result.get(k);
    if (ts === undefined) result.set(k, [value]);
    else return ts.push(value);
  });
  return result;
}

const outputDir = path.join(process.cwd(), "public", "results");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  progress(`Created output directory: ${outputDir}`);
}

function writeGz(fileName: string, data: string): void {
  const outputFile = path.join(outputDir, `${fileName}.gz`);
  fs.writeFileSync(outputFile, zlib.gzipSync(Buffer.from(data, 'utf8')));
  
  const rawSize = Buffer.byteLength(data);
  const gzipSize = fs.statSync(outputFile).size;
  const compression = ((1 - gzipSize / rawSize) * 100).toFixed(1);
  progress(`✓ ${outputFile} (${rawSize}→${gzipSize}, ${compression}% compression)`);
}

function surnameHash(name: string): number {
  const m = name.match(/(\w+)$/);
  const last = m ? m[1] : "";
  let h = 9;
  for (let i = 0; i < last.length; i++)
    h = Math.imul(h ^ last.charCodeAt(i), 9 ** 9);
  return Math.abs(h ^ (h >>> 9));
}

function writeYearData(allResults: Result[]) {
  const byYear = groupBy(allResults, (r) => r.year.substring(0, 4));
  const yearInfo: YearInfo[] = [];
  byYear.forEach((results, year) => {
    const uniqueRaces = new Set<string>();
    const uniqueClubs = new Set<string>();
    const uniqueRunners = new Map<string, Set<string>>();
    for (const r of results) {
      uniqueRaces.add(r.raceId);
      uniqueClubs.add(r.club);
      const categorySet =
        uniqueRunners.get(r.category) ||
        uniqueRunners.set(r.category, new Set<string>()).get(r.category)!;
      categorySet.add(r.name);
    }

    const nRunners: { [cat: string]: number } = {};
    for (const [cat, names] of uniqueRunners)
      nRunners[cat] = names.size;
    yearInfo.push({
      year,
      nRaces: uniqueRaces.size,
      nClubs: uniqueClubs.size,
      nResults: results.length,
      nRunners,
    });
  });
  writeGz("years.json", JSON.stringify(yearInfo));
}

function writeRaceData(allResults: Result[]) {
  const byRaceId = groupBy(allResults, (r) => r.raceId);
  const encoder = new TextEncoder();
  const raceInfo = [] as RaceInfo[];
  byRaceId.forEach((results, raceId) => {
    const { data, content } = matter.read(`races/${raceId}/index.md`);
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
      organiser: data.organiser
        ? Array.from(encoder.encode(data.organiser))
        : undefined,
    };
    raceInfo.push(info);
;
    const hasGpx = fs.existsSync(`races/${raceId}/route.gpx`);
    if (hasGpx)
      fs.copyFileSync(
        `races/${raceId}/route.gpx`,
        `${outputDir}/${raceId}.gpx`,
      );
    writeGz(`${raceId}-info.html`, JSON.stringify(md.render(content)));
    writeGz(`${raceId}-results.json`, JSON.stringify(results));
  });
  writeGz("races.json", JSON.stringify(raceInfo));
}

function writeRunnerData(allResults: Result[]) {
  const byRunnerHash = groupBy(allResults, (r) => surnameHash(r.name) % 100);
  byRunnerHash.forEach((results, hash) => {
    writeGz(`R-${hash}.json`, JSON.stringify(results));
  });
}

function summariseCategories(allResults: Result[]): void {
  const uniqueCats = new Set<string>();
  const cleanCats = new Set<string>();
  for (const result of allResults) {
    uniqueCats.add(result.category);
    for (const cat in result.categoryPos) cleanCats.add(cat);
  }

  progress(`Unique categories: ${Array.from(uniqueCats.values()).join(", ")}\n`);
  progress(`Clean categories: ${Array.from(cleanCats.values()).join(", ")}\n`);
}

async function main() {
  const allResults = await readResults();
  writeYearData(allResults);
  writeRaceData(allResults);
  writeRunnerData(allResults);
  summariseCategories(allResults);

  progress("Done\n");
}

main().catch(console.error);