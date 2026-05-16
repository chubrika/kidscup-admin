import { Component, inject, signal, OnInit, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PlayersService } from '../players.service';
import { Player } from '../../../core/models/player.model';
import { PlayerFormDialogComponent } from '../players-list/player-form-dialog/player-form-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewDialogComponent } from './image-preview-dialog.component';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './player-detail.component.html',
  styles: [`
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-title { flex: 1; margin: 0; font-size: 1.5rem; }
    .info-list { display: grid; grid-template-columns: auto 1fr; gap: 8px 24px; align-items: start; }
    a { color: #2563eb; }
    .thumb-btn {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 8px;
    }
    .thumb-btn:hover .thumb-img { box-shadow: 0 0 0 2px #2563eb; }
    .thumb-img {
      display: block;
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .thumb-hint {
      font-size: 12px;
      color: #6b7280;
    }
  `],
})
export class PlayerDetailComponent implements OnInit {
  readonly playerId = signal<string | undefined>(undefined);
  private readonly playersService = inject(PlayersService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly player = signal<Player | null>(null);

  ngOnInit(): void {
    const id =
    this.route.snapshot.paramMap.get('id') ??
    this.route.parent?.snapshot.paramMap.get('id') ??
    undefined;
  this.playerId.set(id);
  if (!id) return;
    this.playersService.getById(id).subscribe((p) => this.player.set(p ?? null));
  }

  openImagePreview(url: string | undefined, title: string): void {
    if (!url) return;
    this.dialog.open(ImagePreviewDialogComponent, {
      maxWidth: '95vw',
      panelClass: 'image-preview-dialog-panel',
      data: { url, title },
    });
  }

  openEditDialog(): void {
    const p = this.player();
    if (!p) return;
    const ref = this.dialog.open(PlayerFormDialogComponent, { width: '480px', data: p });
    ref.afterClosed().subscribe((result) => {
      if (result?._id) {
        const { _id, ...payload } = result as { _id: string; [k: string]: unknown };
        this.playersService.update(_id, payload).subscribe((updated) => this.player.set(updated));
      }
    });
  }
}
