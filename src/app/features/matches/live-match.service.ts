import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

export type MatchEventType =
  | 'POINT_1'
  | 'POINT_2'
  | 'POINT_3'
  | 'ASSIST'
  | 'REBOUND'
  | 'STEAL'
  | 'BLOCK'
  | 'FOUL';

export interface CreateMatchEventDto {
  playerId: string;
  teamId: string;
  type: MatchEventType;
}

export interface TeamScore {
  teamId: string;
  points: number;
}

export interface MatchStats {
  teamScores: TeamScore[];
}

export interface MatchEvent {
  _id: string;
  matchId: string;
  teamId: string;
  playerId: string;
  type: MatchEventType;
  value: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LiveMatchService {
  constructor(private readonly api: ApiService) {}

  addEvent(matchId: string, dto: CreateMatchEventDto): Observable<{ event: MatchEvent; stats: MatchStats }> {
    return this.api.post<{ event: MatchEvent; stats: MatchStats }>(`/matches/${matchId}/events`, dto);
  }

  getStats(matchId: string): Observable<MatchStats> {
    return this.api.get<MatchStats>(`/matches/${matchId}/team-scores`);
  }

  getTimeline(matchId: string, limit = 50): Observable<MatchEvent[]> {
    return this.api.get<MatchEvent[]>(`/matches/${matchId}/events`, { limit });
  }

  deleteEvent(eventId: string): Observable<{ deleted: MatchEvent; stats: MatchStats }> {
    return this.api.delete<{ deleted: MatchEvent; stats: MatchStats }>(`/events/${eventId}`);
  }
}

