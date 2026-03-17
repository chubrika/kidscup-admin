import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { PlayersService } from '../players.service';
import { Player } from '../../../core/models/player.model';
import { PlayerFormDialogComponent } from './player-form-dialog/player-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeamsService } from '../../teams/teams.service';
import { Team } from '../../../core/models/team.model';

@Component({
  selector: 'app-players-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, RouterLink],
  templateUrl: './players-list.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    a { color: #2563eb; text-decoration: none; }
  `],
})
export class PlayersListComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Player>([]);
  readonly displayedColumns = ['number', 'name', 'position', 'teamName', 'actions'];

  ngOnInit(): void {
    this.playersService.getAll().subscribe((list) => (this.dataSource.data = list));
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(PlayerFormDialogComponent, { width: '480px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (result._id) {
          const { _id, ...payload } = result as { _id: string; [k: string]: unknown };
          this.playersService.update(_id, payload).subscribe(() => this.refresh());
        } else {
          this.playersService.create(result).subscribe(() => this.refresh());
        }
      }
    });
  }

  confirmDelete(player: Player): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Player', message: `Delete ${player.firstName} ${player.lastName}?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.playersService.delete(player._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.playersService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
