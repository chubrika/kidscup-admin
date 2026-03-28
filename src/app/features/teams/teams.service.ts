import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Team, TeamCreateDto, TeamStatus } from '../../core/models/team.model';

export type AdminTeamListFilter = 'all' | TeamStatus;

@Injectable({ providedIn: 'root' })
export class TeamsService {
  constructor(private readonly api: ApiService) {}

  /** Admin-only: all teams or filtered by approval status */
  getAdminTeams(filter: AdminTeamListFilter = 'all'): Observable<Team[]> {
    const params: Record<string, string> = {};
    if (filter !== 'all') {
      params['status'] = filter as TeamStatus;
    }
    return this.api.get<Team[]>('/admin/teams', params);
  }

  /** Alias for {@link getAdminTeams}('all') — keeps older call sites working */
  getAll(): Observable<Team[]> {
    return this.getAdminTeams('all');
  }

  approve(id: string): Observable<Team> {
    return this.api.patch<Team>(`/admin/teams/${id}/approve`, {});
  }

  reject(id: string): Observable<Team> {
    return this.api.patch<Team>(`/admin/teams/${id}/reject`, {});
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
