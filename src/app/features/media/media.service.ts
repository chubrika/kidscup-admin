import { Injectable } from '@angular/core';
import { Observable, filter, map, switchMap, take } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UploadService } from '@app/core/services/upload.service';
import { Season } from '@app/core/models/season.model';

export interface UploadResult {
  season: Season;
  key: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(
    private readonly api: ApiService,
    private readonly upload: UploadService,
  ) {}

  /**
   * Uploads a file to Cloudflare (signed URL), then attaches it to a season in DB.
   * Backend will move temp object into `seasons/<seasonId>/...` and persist the public URL.
   */
  uploadSeasonPhoto(seasonId: string, file: File): Observable<UploadResult> {
    return this.upload.getUploadUrl(file.type).pipe(
      switchMap(({ uploadUrl, key, fileUrl }) =>
        this.upload.putToSignedUrl(uploadUrl, file).pipe(
          filter((p) => p === 100),
          take(1),
          switchMap(() => this.api.post<Season>(`/seasons/${seasonId}/photos`, { key })),
          map((season) => ({ season, key, url: fileUrl })),
        ),
      ),
    );
  }

  uploadSeasonAlbumPhoto(seasonId: string, albumId: string, file: File): Observable<UploadResult> {
    return this.upload.getUploadUrl(file.type).pipe(
      switchMap(({ uploadUrl, key, fileUrl }) =>
        this.upload.putToSignedUrl(uploadUrl, file).pipe(
          filter((p) => p === 100),
          take(1),
          switchMap(() =>
            this.api.post<Season>(`/seasons/${seasonId}/albums/${albumId}/photos`, { key }),
          ),
          map((season) => ({ season, key, url: fileUrl })),
        ),
      ),
    );
  }

  createSeasonAlbum(seasonId: string, title: string): Observable<Season> {
    return this.api.post<Season>(`/seasons/${seasonId}/albums`, { title });
  }
}
