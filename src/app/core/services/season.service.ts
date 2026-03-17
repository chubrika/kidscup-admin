import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Season, SeasonCreateDto } from '../models/season.model';

export interface GetSeasonsParams {
  ageCategory?: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SeasonService {
  constructor(private readonly api: ApiService) {}

  getSeasons(params?: GetSeasonsParams): Observable<Season[]> {
    const query: Record<string, string | number | boolean> = {};
    if (params?.ageCategory) query['ageCategory'] = params.ageCategory;
    if (params?.isActive !== undefined) query['isActive'] = params.isActive;
    return this.api.get<Season[]>('/seasons', Object.keys(query).length > 0 ? query : undefined);
  }

  getSeasonById(id: string): Observable<Season> {
    return this.api.get<Season>(`/seasons/${id}`);
  }

  createSeason(dto: SeasonCreateDto): Observable<Season> {
    return this.api.post<Season>('/seasons', dto);
  }

  updateSeason(id: string, dto: Partial<SeasonCreateDto>): Observable<Season> {
    return this.api.patch<Season>(`/seasons/${id}`, dto);
  }

  deleteSeason(id: string): Observable<void> {
    return this.api.delete<void>(`/seasons/${id}`);
  }
}
