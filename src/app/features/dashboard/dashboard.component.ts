import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from './dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styles: [`
    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 24px;
      color: #0f172a;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #fff;
    }
    .stat-icon.teams { background: #3b82f6; }
    .stat-icon.players { background: #8b5cf6; }
    .stat-icon.upcoming { background: #10b981; }
    .stat-icon.finished { background: #f59e0b; }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe((s) => this.stats.set(s));
  }
}
