import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  Video,
  VideoCreateDto,
  VIDEO_CATEGORIES,
  VIDEO_STATUSES,
} from '@app/core/models/video.model';
import {
  extractYouTubeId,
  youtubeThumbnailUrl,
  youtubeUrlValidator,
} from '@app/core/utils/youtube.util';

@Component({
  selector: 'app-video-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './video-form-dialog.component.html',
  styles: [`
    .video-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
    }

    .video-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .video-field {
      display: block;
      width: 100%;
    }

    .youtube-preview {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .youtube-preview__frame {
      width: 320px;
      max-width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(0, 0, 0, 0.12);
      background: #0f172a;
      display: grid;
      place-items: center;
    }

    .youtube-preview__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .youtube-preview__placeholder {
      font-size: 0.875rem;
      color: #94a3b8;
      text-align: center;
      padding: 16px;
    }

    .youtube-preview__meta {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 160px;
    }

    .youtube-preview__id {
      font-family: ui-monospace, monospace;
      font-size: 0.8125rem;
      color: #334155;
    }

  `],
})
export class VideoFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<VideoFormDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = inject<Video | null>(MAT_DIALOG_DATA, { optional: true });

  readonly categories = VIDEO_CATEGORIES;
  readonly statuses = VIDEO_STATUSES;
  readonly previewVideoId = signal<string | null>(null);
  readonly thumbnailUrl = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: [this.data?.title ?? '', Validators.required],
    description: [this.data?.description ?? ''],
    youtubeUrl: [
      this.data?.youtubeId ? `https://www.youtube.com/watch?v=${this.data.youtubeId}` : '',
      [Validators.required, youtubeUrlValidator()],
    ],
    category: [this.data?.category ?? 'Highlights' as const, Validators.required],
    status: [this.data?.status ?? 'draft' as const, Validators.required],
  });

  ngOnInit(): void {
    this.updatePreview(this.form.controls.youtubeUrl.value);

    this.form.controls.youtubeUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.updatePreview(value));
  }

  onThumbnailError(): void {
    const id = this.previewVideoId();
    if (!id) return;
    const current = this.thumbnailUrl();
    const fallback = youtubeThumbnailUrl(id, 'hqdefault');
    if (current !== fallback) {
      this.thumbnailUrl.set(fallback);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const youtubeId = extractYouTubeId(v.youtubeUrl);
    if (!youtubeId) return;

    const dto: VideoCreateDto & { _id?: string } = {
      title: v.title.trim(),
      description: v.description.trim(),
      youtubeId,
      category: v.category,
      status: v.status,
    };

    if (this.data?._id) dto._id = this.data._id;
    this.ref.close(dto);
  }

  private updatePreview(value: string): void {
    const videoId = extractYouTubeId(value);
    this.previewVideoId.set(videoId);
    this.thumbnailUrl.set(videoId ? youtubeThumbnailUrl(videoId) : null);
  }
}
