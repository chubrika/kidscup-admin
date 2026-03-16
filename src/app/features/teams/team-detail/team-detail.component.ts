import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly route = inject(ActivatedRoute);
  private readonly teamsService = inject(TeamsService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly teamId = signal<string | undefined>(undefined);
  readonly team = signal<Team | null>(null);

  ngOnInit(): void {
    // Prefer current route param, fallback to parent (e.g. when using loadChildren)
    const id =
      this.route.snapshot.paramMap.get('id') ??
      this.route.parent?.snapshot.paramMap.get('id') ??
      undefined;
    this.teamId.set(id);
    if (!id) return;
    this.teamsService.getById(id).subscribe((t) => this.team.set(t ?? null));
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
