import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatchesService } from '../matches.service';
import { Match } from '../../../core/models/match.model';
import { MatchFormDialogComponent } from './match-form-dialog/match-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-matches-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, RouterLink],
  templateUrl: './matches-list.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    a { color: #2563eb; text-decoration: none; }
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
      if (ok) this.matchesService.delete(match.id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.matchesService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
