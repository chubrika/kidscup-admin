import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';

export interface MediaItem {
  id: string;
  url: string;
  type: 'team' | 'match';
  entityId: string;
  caption?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  constructor(private readonly api: ApiService) {}

  getByType(type: 'team' | 'match', entityId?: string): Observable<MediaItem[]> {
    const params: Record<string, string> = { type };
    if (entityId) params['entityId'] = entityId;
    return this.api.get<MediaItem[]>('/media', params).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  upload(file: File, type: 'team' | 'match', entityId: string): Observable<MediaItem> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('entityId', entityId);
    return this.api.post<MediaItem>('/media/upload', formData).pipe(delay(300));
  }
}
