import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { Category, AgeCategoryCreateDto } from '../../core/models/category.model';


@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories').pipe(
      delay(200)
    );
  }

  create(dto: AgeCategoryCreateDto): Observable<Category> {
    return this.api.post<Category>('/categories', dto).pipe(
      delay(200)
    );
  }

  update(id: string, dto: Partial<AgeCategoryCreateDto>): Observable<Category> {
    return this.api.patch<Category>(`/categories/${id}`, dto).pipe(
      delay(200)
    );
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`).pipe(
      delay(200),
      catchError(() => of(undefined)),
    );
  }
}
