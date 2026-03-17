import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Team, TeamCreateDto } from '../../../core/models/team.model';
import { Category } from '../../../core/models/category.model';
import { CategoriesService } from '../../../core/services/categories.service';
import { UploadService } from '../../../core/services/upload.service';
import { Subject, catchError, finalize, last, of, switchMap, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-team-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './team-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 320px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
    .upload-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .preview { width: 96px; height: 96px; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.12); background: #fff; display: grid; place-items: center; }
    .preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .error { color: #b91c1c; font-size: 0.875rem; }
  `],
})
export class TeamFormDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<TeamFormDialogComponent>);
  private readonly categoriesService = inject(CategoriesService);
  private readonly uploadService = inject(UploadService);
  readonly data = inject<Team | null>(MAT_DIALOG_DATA, { optional: true });

  categories: Category[] = [];

  readonly uploading = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(this.data?.logo ?? null);
  private readonly destroy$ = new Subject<void>();
  private closingForSubmit = false;

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', Validators.required],
    city: [this.data?.city ?? '', Validators.required],
    coachName: [this.data?.coachName ?? '', Validators.required],
    ageCategory: [this.getAgeCategoryId(this.data) ?? '', Validators.required],
    logo: [this.data?.logo ?? ''],
    logoKey: [this.data?.logoKey ?? ''],
  });

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe((list) => {
      this.categories = list;
      const current = this.form.get('ageCategory')?.value;
      if ((current === '' || current == null) && list.length > 0) {
        this.form.patchValue({ ageCategory: list[0]._id });
      }
    });

    // Cleanup temp upload on cancel/backdrop/escape
    this.ref.beforeClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.closingForSubmit) return;
      this.cleanupTempUpload();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getAgeCategoryId(team: Team | null | undefined): string | null {
    if (!team?.ageCategory) return null;
    const ac = team.ageCategory;
    if (typeof ac === 'string') {
      // Only use if it looks like a MongoDB ObjectId (24 hex chars); otherwise it's likely the category name (e.g. from mock data)
      return /^[a-fA-F0-9]{24}$/.test(ac) ? ac : null;
    }
    return (ac as { _id?: string })._id ?? null;
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

    const previousKey = this.form.getRawValue().logoKey;

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
              this.form.patchValue({ logo: res.fileUrl, logoKey: res.key });
              this.previewUrl.set(res.fileUrl);
            }),
          )
        ),
        catchError((err) => {
          const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : 'Upload failed';
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

  cancel(): void {
    // Triggers beforeClosed() cleanup
    this.ref.close();
  }

  private cleanupTempUpload(): void {
    const key = this.form.getRawValue().logoKey;
    if (key?.startsWith('temp/')) {
      this.uploadService.deleteUpload(key).pipe(catchError(() => of(undefined)), takeUntil(this.destroy$)).subscribe();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const raw = value.ageCategory != null && value.ageCategory !== '' ? String(value.ageCategory).trim() : undefined;
    // Only send if it looks like a MongoDB ObjectId; never send category name (e.g. "U12")
    const ageCategoryValue = raw && /^[a-fA-F0-9]{24}$/.test(raw) ? raw : undefined;
    const dto: TeamCreateDto & { id?: string } = {
      name: value.name,
      city: value.city,
      coachName: value.coachName,
      ageCategory: ageCategoryValue,
      logo: value.logo || undefined,
      logoKey: value.logoKey || undefined,
    };
    if (this.data?._id) dto.id = this.data._id;
    this.closingForSubmit = true;
    this.ref.close(dto);
  }
}
