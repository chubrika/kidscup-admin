import { Category } from "./category.model";
import { Team } from "./team.model";

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam?: Team;
  awayTeam?: Team;
  date: string;
  time: string;
  location: string;
  ageCategory: Category;
  status: MatchStatus;
  scoreHome?: number;
  scoreAway?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MatchCreateDto {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  location: string;
  ageCategory: string;
  status: MatchStatus;
  scoreHome?: number;
  scoreAway?: number;
}

export interface PlayerMatchStat {
  id: string;
  playerId: string;
  matchId: string;
  points: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  fouls?: number;
  minutesPlayed?: number;
}
