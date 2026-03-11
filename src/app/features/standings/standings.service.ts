import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { StandingRow } from '../../core/models/standing.model';

@Injectable({ providedIn: 'root' })
export class StandingsService {
  constructor(private readonly api: ApiService) {}

  getByCategory(category?: string): Observable<StandingRow[]> {
    const params = category ? { ageCategory: category } : undefined;
    return this.api.get<StandingRow[]>('/standings', params).pipe(
      delay(200),
      catchError(() =>
        of([
          { teamId: '1', teamName: 'Eagles', played: 5, wins: 4, losses: 1, points: 12, pointsFor: 320, pointsAgainst: 280, ageCategory: 'U12' },
          { teamId: '2', teamName: 'Tigers', played: 5, wins: 3, losses: 2, points: 9, pointsFor: 300, pointsAgainst: 290, ageCategory: 'U12' },
        ]),
      ),
    );
  }
}
