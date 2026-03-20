import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatchesService } from '../matches.service';
import { Match, MatchStatus } from '../../../core/models/match.model';
import { MatchFormDialogComponent } from './match-form-dialog/match-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatCardModule, RouterLink],
  templateUrl: './matches-list.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    a { color: #2563eb; text-decoration: none; }
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
      text-transform: capitalize;
    }
    .status-live { background: #dcfce7; color: #15803d; }
    .status-scheduled { background: #dbeafe; color: #1d4ed8; }
    .status-finished { background: #e5e7eb; color: #374151; }
    .status-postponed { background: #fef3c7; color: #a16207; }
    .status-cancelled { background: #fee2e2; color: #b91c1c; }
  `],
})
export class MatchesListComponent implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Match>([]);
  readonly displayedColumns = ['date', 'match', 'location', 'status', 'score', 'actions'];

  ngOnInit(): void {
    this.matchesService.getAll().subscribe((list) => (this.dataSource.data = list));
  }

  statusClass(status: MatchStatus): string {
    switch (status) {
      case 'live':
        return 'status-live';
      case 'scheduled':
        return 'status-scheduled';
      case 'finished':
        return 'status-finished';
      case 'postponed':
        return 'status-postponed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(MatchFormDialogComponent, { width: '520px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (result.id) {
          this.matchesService.update(result.id, result).subscribe(() => this.refresh());
        } else {
          this.matchesService.create(result).subscribe(() => this.refresh());
        }
      }
    });
  }

  confirmDelete(match: Match): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Match', message: 'Delete this match?' },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.matchesService.delete(match._id).subscribe(() => this.refresh());
    });
  }

  formatDateGeorgian(date: string): string {
    return new Date(date).toLocaleDateString('ka-GE');
  }
  private refresh(): void {
    this.matchesService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
