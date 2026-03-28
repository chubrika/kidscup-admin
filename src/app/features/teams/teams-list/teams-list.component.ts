import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TeamsService, AdminTeamListFilter } from '../teams.service';
import { Team } from '../../../core/models/team.model';
import { TeamFormDialogComponent } from '../team-form-dialog/team-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TeamPendingReviewDialogComponent } from '../team-pending-review-dialog/team-pending-review-dialog.component';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatButtonToggleModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './teams-list.component.html',
  styles: [
    `
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        flex-wrap: wrap;
        gap: 12px;
      }
      .teams-table {
        width: 100%;
      }
      a {
        color: #2563eb;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .filter-toggle {
        margin-bottom: 16px;
      }
      .status-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }
      .status-pending {
        background: #fef3c7;
        color: #92400e;
      }
      .status-approved {
        background: #d1fae5;
        color: #065f46;
      }
      .status-rejected {
        background: #fee2e2;
        color: #991b1b;
      }
      .status-unknown {
        background: #f3f4f6;
        color: #4b5563;
      }
      .teams-icon-approve mat-icon {
        color: #16a34a;
      }
      .teams-icon-approve:hover mat-icon {
        color: #15803d;
      }
      .teams-icon-reject mat-icon {
        color: #991b1b;
      }
      .teams-icon-reject:hover mat-icon {
        color: #7f1d1d;
      }
      .teams-icon-edit mat-icon {
        color:rgb(255, 177, 9);
      }
      .teams-icon-edit:hover mat-icon {
        color:rgb(197, 157, 0);
      }
      .teams-icon-delete mat-icon {
        color: #991b1b;
      }
      .teams-icon-delete:hover mat-icon {
        color: #7f1d1d;
      }
      .teams-icon-view mat-icon {
        color: #2563eb;
      }
      .teams-icon-view:hover mat-icon {
        color: #1d4ed8;
      }
    `,
  ],
})
export class TeamsListComponent implements OnInit {
  private readonly teamsService = inject(TeamsService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Team>([]);
  readonly displayedColumns = ['name', 'city', 'coachName', 'ageCategory', 'status', 'actions'];
  listFilter: AdminTeamListFilter = 'all';

  ngOnInit(): void {
    this.refresh();
  }

  onFilterChange(filter: AdminTeamListFilter): void {
    this.listFilter = filter;
    this.refresh();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(TeamFormDialogComponent, { width: '480px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (result.id) {
          this.teamsService.update(result.id, result).subscribe(() => this.refresh());
        } else {
          this.teamsService.create(result).subscribe(() => this.refresh());
        }
      }
    });
  }

  openPendingReview(team: Team): void {
    const ref = this.dialog.open(TeamPendingReviewDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { team },
    });
    ref.afterClosed().subscribe((outcome) => {
      if (outcome === 'approved' || outcome === 'rejected') {
        this.refresh();
      }
    });
  }

  quickApprove(team: Team): void {
    this.teamsService.approve(team._id).subscribe({
      next: () => this.refresh(),
      error: () => undefined,
    });
  }

  quickReject(team: Team): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'გუნდის უარყოფა', message: `უარყოთ "${team.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.teamsService.reject(team._id).subscribe({
          next: () => this.refresh(),
          error: () => undefined,
        });
      }
    });
  }

  confirmDelete(team: Team): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Team', message: `Delete "${team.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.teamsService.delete(team._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.teamsService.getAdminTeams(this.listFilter).subscribe({
      next: (teams) => (this.dataSource.data = teams),
      error: () => (this.dataSource.data = []),
    });
  }

  statusLabel(status: string | undefined): string {
    switch (status) {
      case 'pending':
        return 'მოლოდინში';
      case 'approved':
        return 'დამტკიცებული';
      case 'rejected':
        return 'უარყოფილი';
      default:
        return '—';
    }
  }

  statusClass(status: string | undefined): string {
    switch (status) {
      case 'pending':
        return 'status-pill status-pending';
      case 'approved':
        return 'status-pill status-approved';
      case 'rejected':
        return 'status-pill status-rejected';
      default:
        return 'status-pill status-unknown';
    }
  }
}
