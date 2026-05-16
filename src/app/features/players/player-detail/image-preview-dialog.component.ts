import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export type ImagePreviewDialogData = {
  url: string;
  title: string;
};

@Component({
  selector: 'app-image-preview-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content class="content">
      <img [src]="data.url" [alt]="data.title" class="preview-img" />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .content {
        padding: 0 24px 8px;
        overflow: auto;
      }
      .preview-img {
        display: block;
        max-width: min(90vw, 960px);
        max-height: 80vh;
        width: auto;
        height: auto;
        margin: 0 auto;
        border-radius: 8px;
        object-fit: contain;
      }
    `,
  ],
})
export class ImagePreviewDialogComponent {
  readonly data = inject<ImagePreviewDialogData>(MAT_DIALOG_DATA);
}
