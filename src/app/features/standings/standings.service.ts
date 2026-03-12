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
        of(),
      ),
    );
  }
}
