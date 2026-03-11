import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats').pipe(
      delay(200),
      catchError(() =>
        of({
          totalTeams: 12,
          totalPlayers: 96,
          upcomingMatches: 8,
          finishedMatches: 24,
        } as DashboardStats),
      ),
    );
  }
}
