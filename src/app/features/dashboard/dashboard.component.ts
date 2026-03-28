import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject, catchError, map, merge, of, startWith, switchMap } from 'rxjs';
import { DashboardService } from './dashboard.service';
import {
  DashboardActivityType,
  DashboardBundle,
  DashboardCharts,
} from '../../core/models/dashboard.model';
import { Match } from '../../core/models/match.model';

type DashboardState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok';
      data: DashboardBundle;
      lineChartData: ChartData<'line'>;
      pieChartData: ChartData<'pie'> | null;
    };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    BaseChartDirective,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly refresh$ = new Subject<void>();

  readonly state$ = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() =>
      merge(
        of<DashboardState>({ kind: 'loading' }),
        this.dashboardService.getDashboardBundle().pipe(
          map((data) => ({
            kind: 'ok' as const,
            data,
            lineChartData: this.buildLineChartData(data.charts),
            pieChartData: this.buildPieChartData(data.charts),
          })),
          catchError(() =>
            of<DashboardState>({
              kind: 'error',
              message:
                'Failed to load dashboard. Check your connection and that the API is running, then try again.',
            }),
          ),
        ),
      ),
    ),
  );

  readonly lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  readonly pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  retry(): void {
    this.refresh$.next();
  }

  /** True when the 30-day series has no registrations (all zeros). */
  isRegistrationsChartEmpty(data: ChartData<'line'>): boolean {
    const series = data.datasets[0]?.data;
    if (!series?.length) {
      return true;
    }
    return series.every((n) => Number(n) === 0);
  }

  activityIcon(type: DashboardActivityType): string {
    switch (type) {
      case 'team_registered':
        return 'group_add';
      case 'team_approved':
        return 'verified';
      case 'match_created':
        return 'event';
      case 'player_added':
        return 'person_add';
      default:
        return 'notifications';
    }
  }

  teamName(m: Match, side: 'home' | 'away'): string {
    const t = side === 'home' ? m.homeTeam : m.awayTeam;
    return t?.name ?? 'TBD';
  }

  displayMatchStatus(status: string): string {
    switch (status) {
      case 'live':
        return 'Live';
      case 'finished':
        return 'Finished';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Upcoming';
    }
  }

  matchStatusClass(status: string): string {
    switch (status) {
      case 'live':
        return 'match-pill match-pill--live';
      case 'finished':
        return 'match-pill match-pill--finished';
      case 'cancelled':
        return 'match-pill match-pill--cancelled';
      default:
        return 'match-pill match-pill--upcoming';
    }
  }

  private buildLineChartData(charts: DashboardCharts): ChartData<'line'> {
    const map = new Map(charts.registrations.map((r) => [r.date, r.count]));
    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      );
      data.push(map.get(key) ?? 0);
    }
    return {
      labels,
      datasets: [
        {
          label: 'Teams registered',
          data,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }

  private buildPieChartData(charts: DashboardCharts): ChartData<'pie'> | null {
    const { pending, approved, rejected } = charts.teamStatus;
    const sum = pending + approved + rejected;
    if (sum === 0) {
      return null;
    }
    return {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [
        {
          data: [pending, approved, rejected],
          backgroundColor: ['#f59e0b', '#22c55e', '#f87171'],
          borderWidth: 0,
        },
      ],
    };
  }
}
