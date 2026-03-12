export interface StandingRow {
  _id: string;
  categoryId: string; 
  categoryName: string;
  standings: TeamStanding[];
}

export interface TeamStanding {
  _id: string;
  teamId: string;
  teamName: string;
  teamLogo?: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
}