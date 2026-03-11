import { Component, input, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { MatchesService } from '@app/features/matches/matches.service';
import { Match } from '@app/core/models/match.model';

@Component({
  selector: 'app-team-matches-tab',
  standalone: true,
  imports: [MatTableModule, MatCardModule, RouterLink],
  templateUrl: './team-matches-tab.component.html',
  styles: [`.full-width { width: 100%; } a { color: #2563eb; }`],
})
export class TeamMatchesTabComponent implements OnInit {
  readonly teamId = input.required<string>();
  private readonly matchesService = inject(MatchesService);
  readonly matches = signal<Match[]>([]);
  readonly displayedColumns = ['date', 'match', 'score'];

  ngOnInit(): void {
    this.matchesService.getByTeam(this.teamId()).subscribe((list) => this.matches.set(list));
  }
}
