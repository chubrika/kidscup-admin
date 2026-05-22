import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { StandingsGroup } from '../../core/models/standing.model';

@Injectable({ providedIn: 'root' })
export class StandingsService {
  constructor(private readonly api: ApiService) {}

  getByCategory(category?: string, seasonId?: string): Observable<StandingsGroup[]> {
    const params: Record<string, string> = {};
    if (category) params['ageCategory'] = category;
    if (seasonId) params['seasonId'] = seasonId;
    const query = Object.keys(params).length ? params : undefined;
    return this.api.get<StandingsGroup[]>('/standings', query).pipe(
      delay(200),
      catchError(() =>
        of(),
      ),
    );
  }
}
