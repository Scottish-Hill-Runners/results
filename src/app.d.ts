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
    femaleRecord?: string
  }

  type RunnerInfo = {
    raceId: string,
    title: string,
    year: string,
    time: string,
    position: number,
    category: string,
    categoryPos: { [cat: string]: number },
    distance: number,
    climb?: number
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
    searchable?: boolean,
    cmp?: (a: T, b: T) => number,
    width?: string
  }
}

export {};
