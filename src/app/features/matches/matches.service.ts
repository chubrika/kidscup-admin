import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Match, MatchCreateDto } from '../../core/models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchesService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Match[]> {
    return this.api.get<Match[]>('/matches').pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getByTeam(teamId: string): Observable<Match[]> {
    return this.api.get<Match[]>('/matches', { teamId }).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<Match | null> {
    return this.api.get<Match>(`/matches/${id}`).pipe(
      delay(200),
      catchError(() => of(null)),
    );
  }

  create(dto: MatchCreateDto): Observable<Match> {
    const body = {
      homeTeam: dto.homeTeamId,
      awayTeam: dto.awayTeamId,
      date: dto.date,
      time: dto.time,
      location: dto.location,
      ageCategory: dto.ageCategory || undefined,
      season: dto.seasonId || undefined,
      status: dto.status,
      scoreHome: dto.scoreHome,
      scoreAway: dto.scoreAway,
    };
    return this.api.post<Match>('/matches', body).pipe(
      delay(200),
      catchError(() => of({ id: String(Date.now()), ...dto } as unknown as unknown as Match)),
    );
  }

  update(id: string, dto: Partial<MatchCreateDto>): Observable<Match> {
    const { seasonId, ...rest } = dto;
    const body = { ...rest, ...(seasonId !== undefined && { season: seasonId }) };
    return this.api.patch<Match>(`/matches/${id}`, body).pipe(
      delay(200),
      catchError(() => of({ id, ...dto } as unknown as Match)),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/matches/${id}`).pipe(
      delay(200),
      catchError(() => of(undefined)),
    );
  }
}
