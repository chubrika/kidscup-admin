import { Component, inject, signal, OnInit, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TeamsService } from '../teams.service';
import { Team } from '../../../core/models/team.model';
import { TeamFormDialogComponent } from '../team-form-dialog/team-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TeamInfoTabComponent } from './team-info-tab/team-info-tab.component';
import { TeamPlayersTabComponent } from './team-players-tab/team-players-tab.component';
import { TeamMatchesTabComponent } from './team-matches-tab/team-matches-tab.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TeamInfoTabComponent,
    TeamPlayersTabComponent,
    TeamMatchesTabComponent,
  ],
  templateUrl: './team-detail.component.html',
  styles: [`
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .page-title { flex: 1; margin: 0; font-size: 1.5rem; }
  `],
})
export class TeamDetailComponent implements OnInit {
  readonly teamId = input.required<string>();
  private readonly teamsService = inject(TeamsService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly team = signal<Team | null>(null);

  ngOnInit(): void {
    this.teamsService.getById(this.teamId()).subscribe((t) => this.team.set(t ?? null));
  }

  openEditDialog(): void {
    const t = this.team();
    if (!t) return;
    const ref = this.dialog.open(TeamFormDialogComponent, { width: '480px', data: t });
    ref.afterClosed().subscribe((result) => {
      if (result?.id) {
        this.teamsService.update(result.id, result).subscribe((updated) => this.team.set(updated));
      }
    });
  }
}
