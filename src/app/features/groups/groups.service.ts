import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Group, GroupCreateDto } from '../../core/models/group.model';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  constructor(private readonly api: ApiService) {}

  getAll(params?: { seasonId?: string; ageCategory?: string }): Observable<Group[]> {
    const query: Record<string, string> = {};
    if (params?.seasonId) query['seasonId'] = params.seasonId;
    if (params?.ageCategory) query['ageCategory'] = params.ageCategory;
    return this.api.get<Group[]>('/groups', query).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  create(dto: GroupCreateDto): Observable<Group> {
    return this.api.post<Group>('/groups', dto);
  }

  update(id: string, dto: Partial<GroupCreateDto>): Observable<Group> {
    return this.api.patch<Group>(`/groups/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/groups/${id}`);
  }
}
