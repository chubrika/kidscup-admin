import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { GroupsService } from './groups.service';
import { Group, GroupFormResult } from '../../core/models/group.model';
import { GroupFormDialogComponent } from './group-form-dialog/group-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SeasonService } from '../../core/services/season.service';
import { Season } from '../../core/models/season.model';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './groups.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .filters { display: flex; gap: 12px; align-items: center; }
    .full-width { width: 100%; }
  `],
})
export class GroupsComponent implements OnInit {
  private readonly groupsService = inject(GroupsService);
  private readonly seasonService = inject(SeasonService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Group>([]);
  readonly displayedColumns = ['name', 'season', 'sortOrder', 'actions'];
  seasons: Season[] = [];
  selectedSeasonId = '';

  ngOnInit(): void {
    this.seasonService.getSeasons().subscribe((list) => {
      this.seasons = list;
      if (list.length && !this.selectedSeasonId) {
        this.selectedSeasonId = list[0]._id;
        this.refresh();
      }
    });
  }

  onSeasonChange(seasonId: string): void {
    this.selectedSeasonId = seasonId;
    this.refresh();
  }

  seasonName(group: Group): string {
    const s = group.season;
    if (typeof s === 'object' && s?.name) return s.name;
    const found = this.seasons.find((x) => x._id === (typeof s === 'string' ? s : ''));
    return found?.name ?? '—';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(GroupFormDialogComponent, {
      width: '420px',
      data: null,
    });
    ref.afterClosed().subscribe((result: GroupFormResult | undefined) => {
      if (result && !result._id) {
        this.groupsService.create(result).subscribe(() => this.refresh());
      }
    });
  }

  openEditDialog(group: Group): void {
    const ref = this.dialog.open(GroupFormDialogComponent, { width: '420px', data: group });
    ref.afterClosed().subscribe((result: GroupFormResult | undefined) => {
      if (result?._id) {
        const { _id, ...dto } = result;
        this.groupsService.update(_id, dto).subscribe(() => this.refresh());
      }
    });
  }

  confirmDelete(group: Group): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'ჯგუფის წაშლა', message: `წავშალოთ "${group.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.groupsService.delete(group._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    const params = this.selectedSeasonId ? { seasonId: this.selectedSeasonId } : undefined;
    this.groupsService.getAll(params).subscribe((list) => (this.dataSource.data = list));
  }
}
