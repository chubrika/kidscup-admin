import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { SeasonService } from '@app/core/services/season.service';
import { Season } from '@app/core/models/season.model';
import { SeasonFormDialogComponent } from './season-form-dialog/season-form-dialog.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-seasons',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './seasons.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `],
})
export class SeasonsComponent implements OnInit {
  private readonly seasonService = inject(SeasonService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Season>([]);
  readonly displayedColumns = ['name', 'ageCategory', 'startDate', 'endDate', 'active', 'actions'];

  ngOnInit(): void {
    this.refresh();
  }

  getCategoryName(season: Season): string {
    const ac = season.ageCategory;
    if (typeof ac === 'object' && ac && 'name' in ac) return (ac as { name: string }).name;
    if (typeof ac === 'string') return ac;
    return '-';
  }

  formatDate(value: string): string {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(SeasonFormDialogComponent, { width: '420px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (result._id) {
          this.seasonService.updateSeason(result._id, result).subscribe(() => this.refresh());
        } else {
          this.seasonService.createSeason(result).subscribe(() => this.refresh());
        }
      }
    });
  }

  openEditDialog(season: Season): void {
    const ref = this.dialog.open(SeasonFormDialogComponent, { width: '420px', data: season });
    ref.afterClosed().subscribe((result) => {
      if (result?._id) this.seasonService.updateSeason(result._id, result).subscribe(() => this.refresh());
    });
  }

  confirmDelete(season: Season): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Season', message: `Delete "${season.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.seasonService.deleteSeason(season._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.seasonService.getSeasons().subscribe((list) => (this.dataSource.data = list));
  }
}
