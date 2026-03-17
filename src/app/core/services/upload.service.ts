import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Observable, distinctUntilChanged, filter, map } from 'rxjs';
import { ApiService } from './api.service';

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  constructor(
    private readonly api: ApiService,
    private readonly http: HttpClient,
  ) {}

  getUploadUrl(type: string): Observable<UploadUrlResponse> {
    return this.api.get<UploadUrlResponse>('/upload-url', { type });
  }

  putToSignedUrl(uploadUrl: string, file: File): Observable<number> {
    const req = new HttpRequest('PUT', uploadUrl, file, {
      headers: new HttpHeaders({ 'Content-Type': file.type }),
      reportProgress: true,
      // signed URL already contains all required auth query params
      responseType: 'text',
    });

    return this.http.request(req).pipe(
      map((evt) => {
        if (evt.type === HttpEventType.Sent) return 0;
        if (evt.type === HttpEventType.UploadProgress) {
          if (!evt.total) return 0;
          return Math.round((evt.loaded / evt.total) * 100);
        }
        if (evt.type === HttpEventType.Response) return 100;
        return null;
      }),
      filter((v): v is number => typeof v === 'number'),
      distinctUntilChanged(),
    );
  }

  deleteUpload(key: string): Observable<void> {
    const encodedKey = encodeURIComponent(key);
    return this.api.delete<void>(`/upload?key=${encodedKey}`);
  }
}

