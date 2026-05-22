export interface StandingsGroup {
  categoryId?: string;
  categoryName?: string;
  groupId?: string | null;
  groupName?: string;
  sortOrder?: number;
  standings: TeamStanding[];
}

/** @deprecated Use StandingsGroup — kept for compatibility */
export interface StandingRow extends StandingsGroup {
  _id?: string;
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