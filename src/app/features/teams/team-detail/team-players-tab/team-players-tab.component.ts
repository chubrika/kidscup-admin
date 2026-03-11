import { Component, input, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { PlayersService } from '@app/features/players/players.service';
import { Player } from '@app/core/models/player.model';

@Component({
  selector: 'app-team-players-tab',
  standalone: true,
  imports: [MatTableModule, MatCardModule, RouterLink],
  templateUrl: './team-players-tab.component.html',
  styles: [`.full-width { width: 100%; } a { color: #2563eb; }`],
})
export class TeamPlayersTabComponent implements OnInit {
  readonly teamId = input.required<string>();
  private readonly playersService = inject(PlayersService);
  readonly players = signal<Player[]>([]);
  readonly displayedColumns = ['number', 'name', 'position'];

  ngOnInit(): void {
    this.playersService.getByTeam(this.teamId()).subscribe((list) => this.players.set(list));
  }
}
