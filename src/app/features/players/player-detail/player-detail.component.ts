import { Component, inject, signal, OnInit, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { PlayersService } from '../players.service';
import { Player } from '../../../core/models/player.model';
import { PlayerFormDialogComponent } from '../players-list/player-form-dialog/player-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './player-detail.component.html',
  styles: [`
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-title { flex: 1; margin: 0; font-size: 1.5rem; }
    .info-list { display: grid; grid-template-columns: auto 1fr; gap: 8px 24px; }
    a { color: #2563eb; }
  `],
})
export class PlayerDetailComponent implements OnInit {
  readonly playerId = input.required<string>();
  private readonly playersService = inject(PlayersService);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);
  readonly player = signal<Player | null>(null);

  ngOnInit(): void {
    this.playersService.getById(this.playerId()).subscribe((p) => this.player.set(p ?? null));
  }

  openEditDialog(): void {
    const p = this.player();
    if (!p) return;
    const ref = this.dialog.open(PlayerFormDialogComponent, { width: '480px', data: p });
    ref.afterClosed().subscribe((result) => {
      if (result?.id) {
        this.playersService.update(result.id, result).subscribe((updated) => this.player.set(updated));
      }
    });
  }
}
