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
    surname: string,
    forename: string,
    club: string,
    category: string,
    categoryPos: { [cat: string]: number },
    time: string
  }
  
  type RaceStats = { [year: string]: {[category: string]: number }}

  type RaceInfo = {
    raceId: string,
    title: string,
    venue: string,
    distance: number,
    climb?: number,
    record?: string,
    femaleRecord?: string
  }
}

export {};
