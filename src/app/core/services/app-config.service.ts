import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PublicAppConfig } from '../models/app-config.model';

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  constructor(private readonly api: ApiService) {}

  getPublicConfig(): Observable<PublicAppConfig> {
    return this.api.get<PublicAppConfig>('/config');
  }

  patchConfig(body: { key: string; value: boolean | string }): Observable<PublicAppConfig> {
    return this.api.patch<PublicAppConfig>('/admin/config', body);
  }
}
