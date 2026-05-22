import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Round, RoundCreateDto } from '../../core/models/round.model';

@Injectable({ providedIn: 'root' })
export class RoundsService {
  constructor(private readonly api: ApiService) {}

  getAll(groupId?: string): Observable<Round[]> {
    const params = groupId ? { groupId } : undefined;
    return this.api.get<Round[]>('/rounds', params).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  create(dto: RoundCreateDto): Observable<Round> {
    return this.api.post<Round>('/rounds', dto);
  }

  update(id: string, dto: Partial<RoundCreateDto>): Observable<Round> {
    return this.api.patch<Round>(`/rounds/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/rounds/${id}`);
  }
}
