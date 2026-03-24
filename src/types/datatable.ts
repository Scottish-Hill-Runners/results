export interface RaceResult {
  raceId: string;
  year: string;
  position: number;
  name: string;
  club: string;
  category: string;
  categoryPos: { [cat: string]: number };
  time: string;
}

export interface YearRaceResult extends RaceResult {
  raceTitle: string;
}

export interface RaceInfo {
  title: string;
  venue: string;
  distance: number;
  climb?: number;
  maleRecord?: string;
  femaleRecord?: string;
  nonBinaryRecord?: string;
  web?: string;
  organiser?: number[];
}

export interface RaceData {
  info: RaceInfo;
  contents: string;
  results: RaceResult[];
  hasGpx: boolean;
}

export interface AllRaceData {
  [raceId: string]: RaceInfo;
}
