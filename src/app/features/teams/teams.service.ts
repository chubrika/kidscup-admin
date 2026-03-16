import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Team, TeamCreateDto } from '../../core/models/team.model';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Team[]> {
    return this.api.get<Team[]>('/teams').pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<Team | null> {
    return this.api.get<Team>(`/teams/${id}`).pipe(
      delay(200),
      catchError(() => of(null)),
    );
  }

  create(dto: TeamCreateDto): Observable<Team> {
    return this.api.post<Team>('/teams', dto).pipe(
      delay(200),
      catchError(() =>
        of({ _id: String(Date.now()), ageCategory: { _id: '', name: '' }, ...dto } as Team),
      ),
    );
  }

  update(id: string, dto: Partial<TeamCreateDto>): Observable<Team> {
    return this.api.patch<Team>(`/teams/${id}`, dto).pipe(
      delay(200),
      catchError(() => of({ _id: id, ageCategory: { _id: '', name: '' }, ...dto } as unknown as Team)),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/teams/${id}`).pipe(
      delay(200),
      catchError(() => of(undefined)),
    );
  }
}
