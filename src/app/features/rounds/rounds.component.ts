import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RoundsService } from './rounds.service';
import { Round, RoundCreateDto } from '../../core/models/round.model';
import { RoundFormDialogComponent } from './round-form-dialog/round-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { GroupsService } from '../groups/groups.service';
import { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-rounds',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatSelectModule, DatePipe],
  templateUrl: './rounds.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
    .filters { display: flex; gap: 12px; align-items: center; }
    .full-width { width: 100%; }
  `],
})
export class RoundsComponent implements OnInit {
  private readonly roundsService = inject(RoundsService);
  private readonly groupsService = inject(GroupsService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Round>([]);
  readonly displayedColumns = ['name', 'roundNumber', 'group', 'date', 'actions'];
  groups: Group[] = [];
  selectedGroupId = '';

  ngOnInit(): void {
    this.groupsService.getAll().subscribe((list) => {
      this.groups = list;
      if (list.length && !this.selectedGroupId) {
        this.selectedGroupId = list[0]._id;
        this.refresh();
      }
    });
  }

  onGroupChange(groupId: string): void {
    this.selectedGroupId = groupId;
    this.refresh();
  }

  groupName(round: Round): string {
    const g = round.group;
    if (typeof g === 'object' && g?.name) return g.name;
    const found = this.groups.find((x) => x._id === (typeof g === 'string' ? g : ''));
    return found?.name ?? '—';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(RoundFormDialogComponent, {
      width: '420px',
      data: { groupId: this.selectedGroupId },
    });
    ref.afterClosed().subscribe((result: RoundCreateDto & { _id?: string } | undefined) => {
      if (result && !result._id) {
        this.roundsService.create(result).subscribe(() => this.refresh());
      }
    });
  }

  openEditDialog(round: Round): void {
    const ref = this.dialog.open(RoundFormDialogComponent, { width: '420px', data: round });
    ref.afterClosed().subscribe((result) => {
      if (result?._id) {
        const { _id, ...dto } = result;
        this.roundsService.update(_id, dto).subscribe(() => this.refresh());
      }
    });
  }

  confirmDelete(round: Round): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'ტურის წაშლა', message: `წავშალოთ "${round.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.roundsService.delete(round._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    if (!this.selectedGroupId) {
      this.dataSource.data = [];
      return;
    }
    this.roundsService.getAll(this.selectedGroupId).subscribe((list) => (this.dataSource.data = list));
  }
}
