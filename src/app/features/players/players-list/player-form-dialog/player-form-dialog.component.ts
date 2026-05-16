import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Player, PlayerCreateDto } from '@app/core/models/player.model';
import { TeamsService } from '@app/features/teams/teams.service';
import { Team } from '@app/core/models/team.model';
import { UploadService } from '@app/core/services/upload.service';
import { Subject, catchError, finalize, last, of, switchMap, takeUntil, tap } from 'rxjs';

/** Basketball positions: short code stored in DB, label shown in UI */
export const PLAYER_POSITIONS: { code: string; label: string }[] = [
  { code: 'PG', label: 'გამთამაშებელი' },
  { code: 'SG', label: 'მსროლელი' },
  { code: 'SF', label: 'მსუბუქი ფორვარდი' },
  { code: 'PF', label: 'მძიმე ფორვარდი' },
  { code: 'C', label: 'ცენტრი' },
];

type UploadKind = 'photo' | 'idDocument';

@Component({
  selector: 'app-player-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './player-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 360px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
    .upload-block { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 4px; }
    .upload-preview {
      width: 96px; height: 96px; border-radius: 12px; overflow: hidden;
      border: 1px solid rgba(0,0,0,0.12); background: #fff;
      display: grid; place-items: center;
    }
    .upload-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .upload-preview--doc { width: 120px; height: 80px; }
    .upload-actions { display: flex; flex-direction: column; gap: 6px; }
    .upload-hint { font-size: 12px; color: #64748b; }
    .upload-label { font-size: 13px; font-weight: 500; color: #334155; margin: 8px 0 0; }
    .upload-error { color: #b91c1c; font-size: 0.875rem; }
  `],
})
export class PlayerFormDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<PlayerFormDialogComponent>);
  private readonly teamsService = inject(TeamsService);
  private readonly uploadService = inject(UploadService);
  readonly data = inject<Player | null>(MAT_DIALOG_DATA, { optional: true });
  readonly teams = signal<Team[]>([]);
  readonly positions = PLAYER_POSITIONS;

  readonly uploadingPhoto = signal(false);
  readonly uploadingIdDocument = signal(false);
  readonly uploadProgress = signal<number | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly previewUrl = signal<string | null>(this.data?.photo ?? null);
  readonly idDocumentPreviewUrl = signal<string | null>(this.data?.idDocument ?? null);
  private readonly destroy$ = new Subject<void>();
  private closingForSubmit = false;

  readonly form = this.fb.nonNullable.group({
    firstName: [this.data?.firstName ?? '', Validators.required],
    lastName: [this.data?.lastName ?? '', Validators.required],
    number: [this.data?.number ?? 0, [Validators.required, Validators.min(0)]],
    position: [this.data?.position ?? '', Validators.required],
    birthDate: [this.data?.birthDate ? new Date(this.data.birthDate).toISOString().split('T')[0] : '', Validators.required],
    height: [this.data?.height ?? null as number | null],
    teamId: [this.getTeamId(this.data) ?? '', Validators.required],
    photo: [this.data?.photo ?? ''],
    photoKey: [this.data?.photoKey ?? ''],
    idDocument: [this.data?.idDocument ?? ''],
    idDocumentKey: [this.data?.idDocumentKey ?? ''],
  });

  private getTeamId(player: Player | null | undefined): string | null {
    const team = player?.teamId;
    if (!team) return null;
    if (typeof team === 'string') return team;
    return team._id ?? null;
  }

  isUploading(): boolean {
    return this.uploadingPhoto() || this.uploadingIdDocument();
  }

  ngOnInit(): void {
    this.teamsService.getAll().subscribe((t) => this.teams.set(t));

    this.ref.beforeClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.closingForSubmit) return;
      this.cleanupTempUploads();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPhotoSelected(evt: Event): void {
    this.onFileSelected(evt, 'photo');
  }

  onIdDocumentSelected(evt: Event): void {
    this.onFileSelected(evt, 'idDocument');
  }

  private onFileSelected(evt: Event, kind: UploadKind): void {
    const input = evt.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    this.uploadError.set(null);
    this.uploadProgress.set(null);
    if (input) input.value = '';

    const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowed.has(file.type)) {
      this.uploadError.set('Only JPG, PNG or WebP images are allowed.');
      return;
    }
    const maxBytes = 4 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.uploadError.set('Max image size is 4MB.');
      return;
    }

    const previousKey =
      kind === 'photo' ? this.form.getRawValue().photoKey : this.form.getRawValue().idDocumentKey;

    const setUploading = (value: boolean) => {
      if (kind === 'photo') this.uploadingPhoto.set(value);
      else this.uploadingIdDocument.set(value);
    };

    setUploading(true);
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
              if (kind === 'photo') {
                this.form.patchValue({ photo: res.fileUrl, photoKey: res.key });
                this.previewUrl.set(res.fileUrl);
              } else {
                this.form.patchValue({ idDocument: res.fileUrl, idDocumentKey: res.key });
                this.idDocumentPreviewUrl.set(res.fileUrl);
              }
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
          setUploading(false);
          this.uploadProgress.set(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  clearIdDocument(): void {
    const key = this.form.getRawValue().idDocumentKey;
    if (key?.startsWith('temp/')) {
      this.uploadService.deleteUpload(key).pipe(catchError(() => of(undefined)), takeUntil(this.destroy$)).subscribe();
    }
    this.form.patchValue({ idDocument: '', idDocumentKey: '' });
    this.idDocumentPreviewUrl.set(null);
  }

  private cleanupTempUploads(): void {
    const { photoKey, idDocumentKey } = this.form.getRawValue();
    if (photoKey?.startsWith('temp/')) {
      this.uploadService.deleteUpload(photoKey).pipe(catchError(() => of(undefined)), takeUntil(this.destroy$)).subscribe();
    }
    if (idDocumentKey?.startsWith('temp/')) {
      this.uploadService.deleteUpload(idDocumentKey).pipe(catchError(() => of(undefined)), takeUntil(this.destroy$)).subscribe();
    }
  }

  cancel(): void {
    this.ref.close();
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: PlayerCreateDto & { _id?: string } = {
      firstName: v.firstName,
      lastName: v.lastName,
      number: v.number,
      position: v.position,
      birthDate: v.birthDate,
      height: v.height ?? undefined,
      teamId: String(v.teamId),
      photo: v.photo || undefined,
      photoKey: v.photoKey || undefined,
      idDocument: v.idDocument,
      idDocumentKey: v.idDocumentKey,
    };
    if (this.data?._id) dto._id = this.data._id;
    this.closingForSubmit = true;
    this.ref.close(dto);
  }
}
