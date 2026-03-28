import { Match } from './match.model';

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  pendingTeams: number;
  matchesToday: number;
  activeTournaments: number;
}

export interface RegistrationPoint {
  date: string;
  count: number;
}

export interface TeamStatusBreakdown {
  pending: number;
  approved: number;
  rejected: number;
}

export interface DashboardCharts {
  registrations: RegistrationPoint[];
  teamStatus: TeamStatusBreakdown;
}

export type DashboardActivityType =
  | 'team_registered'
  | 'team_approved'
  | 'match_created'
  | 'player_added';

export interface DashboardActivityItem {
  type: DashboardActivityType;
  message: string;
  at: string;
}

export interface DashboardBundle {
  stats: DashboardStats;
  charts: DashboardCharts;
  activity: DashboardActivityItem[];
  matchesToday: Match[];
}
