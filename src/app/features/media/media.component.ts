import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MediaService, MediaItem } from './media.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './media.component.html',
  styles: [`
    .upload-section { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-bottom: 24px; }
    .upload-section mat-form-field { width: 200px; }
    .file-name { margin: 8px 0; color: #64748b; }
    .placeholder-info { display: flex; align-items: flex-start; gap: 16px; padding: 24px; background: #f1f5f9; border-radius: 8px; margin-top: 24px; }
    .placeholder-info mat-icon { font-size: 48px; width: 48px; height: 48px; color: #94a3b8; }
    .placeholder-info p { margin: 0; color: #475569; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
  `],
})
export class MediaComponent {
  private readonly mediaService = inject(MediaService);
  uploadType: 'team' | 'match' = 'team';
  entityId = '';
  readonly selectedFile = signal<File | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.selectedFile.set(file);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file || !this.entityId) return;
    this.mediaService.upload(file, this.uploadType, this.entityId).subscribe({
      next: () => this.selectedFile.set(null),
      error: () => {},
    });
  }
}
