// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  type Result = {
    raceId: string,
    year: string,
    position: number,
    name: string,
    club: string,
    category: string,
    categoryPos: { [cat: string]: number },
    time: string
  }
  
  type Block = { [raceId: string]: Result[] };

  type RaceStats = { [year: string]: {[category: string]: number }}

  type RaceInfo = {
    raceId: string,
    title: string,
    venue: string,
    distance: number,
    climb?: number,
    maleRecord?: string,
    femaleRecord?: string,
    nonBinaryRecord?: string,
    web?: string,
    organiser?: number[]
  }

  type CategoryPos = { [cat: string]: number }

  type RunnerInfo = {
    raceId: string,
    title: string,
    year: string,
    time: string,
    position: number,
    category: string,
    categoryPos: CategoryPos,
    club?: string,
    distance: number,
    climb?: number
  }

  type YearInfo = {
    year: string,
    nRaces: number,
    nClubs: number,
    nRunners: { [cat: string]: number }
  }

  type RunnerStats = {
    year: string,
    nRaces: number,
    totalDistance: number,
    totalAscent: number
  }

  type ScaleFactor = { unit: string, scale: (d: number) => string }

  type RunnerData = { [name: string]: number[] }

  type ColumnSpec<T> = {
    header: string,
    display?: (item: T) => string | number,
    link?: (item: T) => { text: string, route: string,  params?: { [key: string]: string } },
    sort?: "asc" | "desc",
    sticky?: boolean,
    ascOnly?: boolean,
    cmp?: (a: T, b: T) => number,
    width?: string
  }
}

type UpdateResult = {
  filename: string,
  suffix: string,
  raceId: string,
  contents: string,
  userName: string,
  editing: boolean
};

export {};
