import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent } from 'ngx-editor';
import { News, NewsCreateDto } from '@app/core/models/news.model';
import { UploadService } from '@app/core/services/upload.service';
import { Subject, catchError, finalize, last, of, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-news-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    NgxEditorComponent,
    NgxEditorMenuComponent,
  ],
  templateUrl: './news-form-dialog.component.html',
  styles: [`
    .news-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
    }

    .news-dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .news-field {
      display: block;
      width: 100%;
    }

    .news-editor-label {
      display: block;
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .news-editor-wrapper {
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      overflow: hidden;
      min-height: 180px;
    }

    .news-editor-wrapper:focus-within {
      border-color: var(--mat-form-field-outline-color, #1976d2);
      border-width: 2px;
    }

    .news-editor-wrapper ::ng-deep .NgxEditor {
      min-height: 160px;
    }

    .news-editor-wrapper ::ng-deep .NgxEditor__Content {
      min-height: 160px;
    }
  `],
})
export class NewsFormDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<NewsFormDialogComponent>);
  private readonly uploadService = inject(UploadService);
  readonly data = inject<News | null>(MAT_DIALOG_DATA, { optional: true });

  editor: Editor | null = null;

  readonly uploading = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(this.data?.photoUrl ?? null);
  private readonly destroy$ = new Subject<void>();
  private closingForSubmit = false;

  readonly form = this.fb.nonNullable.group({
    title: [this.data?.title ?? '', Validators.required],
    description: [this.data?.description ?? ''],
    photoUrl: [this.data?.photoUrl ?? ''],
    photoKey: [this.data?.photoKey ?? ''],
  });

  ngOnInit(): void {
    this.editor = new Editor();

    // Cleanup temp upload on cancel/backdrop/escape
    this.ref.beforeClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.closingForSubmit) return;
      this.cleanupTempUpload();
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.uploadError.set(null);
    this.uploadProgress.set(null);

    // reset input so picking same file again still triggers change
    if (input) input.value = '';

    const allowed = new Set(['image/jpeg', 'image/png']);
    if (!allowed.has(file.type)) {
      this.uploadError.set('Only JPG or PNG images are allowed.');
      return;
    }
    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.uploadError.set('Max image size is 2MB.');
      return;
    }

    const previousKey = this.form.getRawValue().photoKey;

    this.uploading.set(true);
    of(null)
      .pipe(
        switchMap(() => {
          if (previousKey?.startsWith('temp/')) {
            return this.uploadService.deleteUpload(previousKey).pipe(catchError(() => of(undefined)));
          }
          return of(undefined);
        }),
        switchMap(() => this.uploadService.getUploadUrl(file.type)),
        switchMap((res) =>
          this.uploadService.putToSignedUrl(res.uploadUrl, file).pipe(
            tap((p) => this.uploadProgress.set(p)),
            last(),
            tap(() => {
              this.form.patchValue({ photoUrl: res.fileUrl, photoKey: res.key });
              this.previewUrl.set(res.fileUrl);
            }),
          ),
        ),
        catchError((err) => {
          const msg =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message?: unknown }).message)
              : 'Upload failed';
          this.uploadError.set(msg);
          return of(undefined);
        }),
        finalize(() => {
          this.uploading.set(false);
          this.uploadProgress.set(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private cleanupTempUpload(): void {
    const key = this.form.getRawValue().photoKey;
    if (key?.startsWith('temp/')) {
      this.uploadService.deleteUpload(key).pipe(catchError(() => of(undefined)), takeUntil(this.destroy$)).subscribe();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: NewsCreateDto & { _id?: string } = {
      title: v.title,
      description: v.description,
      photoUrl: v.photoUrl,
      photoKey: v.photoKey || undefined,
    };
    if (this.data?._id) (dto as { _id: string })._id = this.data._id;
    this.closingForSubmit = true;
    this.ref.close(dto);
  }
}
