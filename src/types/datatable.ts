export interface DataRow {
  id: string;
  year: number;
  position: number;
  name: string;
  club: string;
  category: string;
  time: string;
}

export interface RaceInfo {
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
}
