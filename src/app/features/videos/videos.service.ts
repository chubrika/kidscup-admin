import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '@app/core/services/api.service';
import { Video, VideoCreateDto } from '@app/core/models/video.model';

@Injectable({ providedIn: 'root' })
export class VideosService {
  private readonly basePath = '/admin/videos';

  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Video[]> {
    return this.api.get<Video[]>(this.basePath).pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<Video | null> {
    return this.api.get<Video>(`${this.basePath}/${id}`).pipe(
      delay(200),
      catchError(() => of(null)),
    );
  }

  create(dto: VideoCreateDto): Observable<Video> {
    return this.api.post<Video>(this.basePath, dto);
  }

  update(id: string, dto: Partial<VideoCreateDto>): Observable<Video> {
    return this.api.patch<Video>(`${this.basePath}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }
}
