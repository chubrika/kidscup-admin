export interface StandingRow {
  teamId: string;
  teamName: string;
  teamLogo?: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  ageCategory: string;
}
