import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Player, PlayerCreateDto } from '../../core/models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayersService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Player[]> {
    return this.api.get<Player[]>('/players').pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getByTeam(teamId: string): Observable<Player[]> {
    return this.api.get<Player[]>('/players', { teamId }).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<Player | null> {
    return this.api.get<Player>(`/players/${id}`).pipe(
      delay(200),
      catchError(() => of(null)),
    );
  }

  create(dto: PlayerCreateDto): Observable<Player> {
    return this.api.post<Player>('/players', dto).pipe(
      delay(200),
      catchError(() => of({ id: String(Date.now()), ...dto } as Player)),
    );
  }

  update(id: string, dto: Partial<PlayerCreateDto>): Observable<Player> {
    return this.api.patch<Player>(`/players/${id}`, dto).pipe(
      delay(200),
      catchError(() => of({ id, ...dto } as Player)),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/players/${id}`).pipe(
      delay(200),
      catchError(() => of(undefined)),
    );
  }
}
