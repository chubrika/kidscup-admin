import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Team } from '../../../core/models/team.model';
import { Player } from '../../../core/models/player.model';
import { PlayersService } from '../../players/players.service';
import { TeamsService } from '../teams.service';

export type TeamPendingReviewDialogData = { team: Team };

@Component({
  selector: 'app-team-pending-review-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './team-pending-review-dialog.component.html',
  styles: [
    `
      h2 {
        margin: 0 0 12px;
        font-size: 1.15rem;
      }
      .meta {
        margin: 0 0 16px;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.65);
        line-height: 1.5;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }
      table {
        width: 100%;
      }
    `,
  ],
})
export class TeamPendingReviewDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<TeamPendingReviewDialogComponent, 'approved' | 'rejected' | undefined>);
  readonly data = inject<TeamPendingReviewDialogData>(MAT_DIALOG_DATA);
  private readonly playersService = inject(PlayersService);
  private readonly teamsService = inject(TeamsService);

  readonly players = signal<Player[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  readonly displayedColumns = ['number', 'name', 'position'];

  ngOnInit(): void {
    this.playersService.getByTeam(this.data.team._id).subscribe({
      next: (list) => {
        this.players.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('მოთამაშეების ჩატვირთვა ვერ მოხერხდა');
        this.loading.set(false);
      },
    });
  }

  approve(): void {
    this.busy.set(true);
    this.teamsService.approve(this.data.team._id).subscribe({
      next: () => {
        this.busy.set(false);
        this.dialogRef.close('approved');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('დამტკიცება ვერ მოხერხდა');
      },
    });
  }

  reject(): void {
    this.busy.set(true);
    this.teamsService.reject(this.data.team._id).subscribe({
      next: () => {
        this.busy.set(false);
        this.dialogRef.close('rejected');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('უარყოფა ვერ მოხერხდა');
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
