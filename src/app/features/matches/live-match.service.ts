import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../core/services/api.service';
import { io, Socket } from 'socket.io-client';

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
export class LiveMatchService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly destroyed$ = new Subject<void>();

  constructor(private readonly api: ApiService) {}

  connectToMatch(matchId: string): void {
    if (this.socket?.connected) return;
    const socketUrl = environment.apiUrl.replace(/\/api\/?$/, '');
    this.socket = io(socketUrl, { transports: ['websocket'] });
    this.socket.emit('match:join', { matchId });
  }

  disconnectFromMatch(matchId: string): void {
    if (!this.socket) return;
    this.socket.emit('match:leave', { matchId });
    this.socket.disconnect();
    this.socket = null;
  }

  onMatchUpdate(): Observable<{ matchId: string; stats: MatchStats }> {
    return new Observable((subscriber) => {
      if (!this.socket) {
        subscriber.error(new Error('Socket not connected. Call connectToMatch(matchId) first.'));
        return;
      }
      const handler = (payload: { matchId: string; stats: MatchStats }) => subscriber.next(payload);
      this.socket.on('match:update', handler);
      return () => this.socket?.off('match:update', handler);
    });
  }

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

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.socket?.disconnect();
    this.socket = null;
  }
}

