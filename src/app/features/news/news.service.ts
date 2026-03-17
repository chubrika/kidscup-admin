import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { News, NewsCreateDto } from '../../core/models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<News[]> {
    return this.api.get<News[]>('/news').pipe(
      delay(200),
      catchError(() => of([])),
    );
  }

  getById(id: string): Observable<News | null> {
    return this.api.get<News>(`/news/${id}`).pipe(
      delay(200),
      catchError(() => of(null)),
    );
  }

  create(dto: NewsCreateDto): Observable<News> {
    return this.api.post<News>('/news', dto).pipe(
      delay(200),
      catchError(() => of({ _id: String(Date.now()), ...dto } as News)),
    );
  }

  update(id: string, dto: Partial<NewsCreateDto>): Observable<News> {
    return this.api.patch<News>(`/news/${id}`, dto).pipe(
      delay(200),
      catchError(() => of({ _id: id, ...dto } as News)),
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/news/${id}`).pipe(
      delay(200),
      catchError(() => of(undefined)),
    );
  }
}
