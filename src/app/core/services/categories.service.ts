import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly api: ApiService) {}

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories').pipe(
      catchError(() => of([]))
    );
  }
}
