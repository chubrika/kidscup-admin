import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import {
  DashboardActivityItem,
  DashboardBundle,
  DashboardCharts,
  DashboardStats,
} from '../../core/models/dashboard.model';
import { Match } from '../../core/models/match.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly api: ApiService) {}

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/admin/dashboard/stats');
  }

  getCharts(): Observable<DashboardCharts> {
    return this.api.get<DashboardCharts>('/admin/dashboard/charts');
  }

  getActivity(): Observable<DashboardActivityItem[]> {
    return this.api.get<DashboardActivityItem[]>('/admin/dashboard/activity');
  }

  getMatchesToday(): Observable<Match[]> {
    return this.api.get<Match[]>('/admin/matches/today');
  }

  /** Loads all dashboard panels in one round-trip bundle. */
  getDashboardBundle(): Observable<DashboardBundle> {
    return forkJoin({
      stats: this.getStats(),
      charts: this.getCharts(),
      activity: this.getActivity(),
      matchesToday: this.getMatchesToday(),
    });
  }
}
