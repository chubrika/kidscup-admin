import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Category, AgeCategoryCreateDto } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './category-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 320px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class CategoryFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<CategoryFormDialogComponent>);
  readonly data = inject<Category | null>(MAT_DIALOG_DATA, { optional: true });

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', Validators.required],
    minAge: [this.data?.minAge ?? null as number | null],
    maxAge: [this.data?.maxAge ?? null as number | null],
    description: [this.data?.description ?? ''],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: AgeCategoryCreateDto & { _id?: string } = {
      name: v.name,
      minAge: v.minAge ?? undefined,
      maxAge: v.maxAge ?? undefined,
      description: v.description || undefined,
    };
    if (this.data?._id) dto._id = this.data._id;
    this.ref.close(dto);
  }
}
