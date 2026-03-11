import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category } from '../models/category.model';

interface CategoryDto {
  id?: string;
  _id?: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly api: ApiService) {}

  getCategories(): Observable<Category[]> {
    return this.api
      .get<CategoryDto[]>('/categories')
      .pipe(
        map((list) =>
          (list || [])
            .map((c) => ({ id: c.id ?? c._id, name: c.name }))
            .filter((cat): cat is Category => !!cat.id)
        )
      );
  }
}
