import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { TeamsService } from '../teams.service';
import { Team } from '../../../core/models/team.model';
import { TeamFormDialogComponent } from '../team-form-dialog/team-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, RouterLink],
  templateUrl: './teams-list.component.html',
  styles: [`
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .teams-table {
      width: 100%;
    }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `],
})
export class TeamsListComponent implements OnInit {
  private readonly teamsService = inject(TeamsService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Team>([]);
  readonly displayedColumns = ['name', 'city', 'coachName', 'ageCategory', 'actions'];

  ngOnInit(): void {
    this.teamsService.getAll().subscribe((teams) => {
      this.dataSource.data = teams;
    });
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

  confirmDelete(team: Team): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Team', message: `Delete "${team.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      console.log(team)
      if (ok) this.teamsService.delete(team._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.teamsService.getAll().subscribe((teams) => (this.dataSource.data = teams));
  }
}
