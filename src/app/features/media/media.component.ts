import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { SeasonService } from '@app/core/services/season.service';
import { Season, SeasonAlbum, SeasonPhoto } from '@app/core/models/season.model';
import { MediaService } from './media.service';
import { catchError, concatMap, finalize, from, of, tap } from 'rxjs';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './media.component.html',
  styles: [`
    .upload-section { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 24px; }
    .upload-section mat-form-field { width: 280px; }
    .file-name { margin: 8px 0; color: #64748b; }
    .files { display: grid; gap: 8px; margin: 12px 0 0; }
    .hint { color: #475569; margin-top: 12px; }
    .error { color: #b91c1c; margin-top: 12px; }
    .albums-header { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 12px; }
    .albums-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
    .album-card { cursor: pointer; border: 1px solid rgba(0,0,0,0.08); }
    .album-card.active { outline: 2px solid #2563eb; }
    .album-title { font-weight: 600; }
    .album-sub { color: #64748b; font-size: 12px; margin-top: 4px; }
    .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-top: 16px; }
    .photo-card { padding: 0; overflow: hidden; border-radius: 12px; }
    .photo { width: 100%; height: 180px; object-fit: cover; display: block; background: #f1f5f9; }
  `],
})
export class MediaComponent implements OnInit {
  private readonly mediaService = inject(MediaService);
  private readonly seasonService = inject(SeasonService);

  seasons: Season[] = [];
  seasonId = '';
  seasonDetails: Season | null = null;
  albumId = '';
  newAlbumTitle = '';

  readonly selectedFiles = signal<File[]>([]);
  readonly uploading = signal(false);
  readonly progressText = signal<string>('');
  readonly errorText = signal<string>('');

  ngOnInit(): void {
    this.seasonService.getSeasons().subscribe({
      next: (list) => {
        this.seasons = list ?? [];
        if (!this.seasonId && this.seasons.length > 0) this.seasonId = this.seasons[0]._id;
        if (this.seasonId) this.loadSeasonDetails(this.seasonId);
      },
      error: () => (this.seasons = []),
    });
  }

  onSeasonChanged(): void {
    const id = String(this.seasonId || '').trim();
    if (!id) {
      this.seasonDetails = null;
      this.albumId = '';
      return;
    }
    this.loadSeasonDetails(id);
  }

  private loadSeasonDetails(id: string): void {
    this.seasonService.getSeasonById(id).subscribe({
      next: (s) => {
        this.seasonDetails = s;
        const albums = (s.albums ?? []) as SeasonAlbum[];
        if (!this.albumId && albums.length > 0) this.albumId = albums[0]._id;
      },
      error: () => (this.seasonDetails = null),
    });
  }

  get selectedAlbumPhotos(): SeasonPhoto[] {
    const season = this.seasonDetails;
    const albumId = String(this.albumId || '').trim();
    if (!season || !albumId) return [];
    const albums = season.albums ?? [];
    const album = albums.find((a) => a._id === albumId);
    return album?.photos ?? [];
  }

  selectAlbum(id: string): void {
    this.albumId = id;
  }

  createAlbum(): void {
    const seasonId = String(this.seasonId || '').trim();
    const title = String(this.newAlbumTitle || '').trim();
    if (!seasonId || !title) return;

    this.mediaService.createSeasonAlbum(seasonId, title).subscribe({
      next: (season) => {
        this.newAlbumTitle = '';
        this.seasonDetails = season;
        const albums = season.albums ?? [];
        if (albums.length > 0) this.albumId = albums[albums.length - 1]._id;
      },
      error: () => (this.errorText.set('Failed to create album.')),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles.set(files);
    this.errorText.set('');
  }

  upload(): void {
    const seasonId = String(this.seasonId || '').trim();
    const albumId = String(this.albumId || '').trim();
    const files = this.selectedFiles();
    if (!seasonId || !albumId || files.length === 0 || this.uploading()) return;

    this.uploading.set(true);
    this.errorText.set('');
    this.progressText.set(`Uploading 0/${files.length}...`);

    from(files)
      .pipe(
        concatMap((file, idx) =>
          this.mediaService.uploadSeasonAlbumPhoto(seasonId, albumId, file).pipe(
            tap(() => this.progressText.set(`Uploaded ${idx + 1}/${files.length}`)),
            catchError(() => {
              this.errorText.set('Upload failed. Check Cloudflare/R2 config and API logs.');
              return of(null);
            }),
          ),
        ),
        finalize(() => {
          this.uploading.set(false);
          this.selectedFiles.set([]);
          this.progressText.set('');
          this.loadSeasonDetails(seasonId);
        }),
      )
      .subscribe();
  }
}
