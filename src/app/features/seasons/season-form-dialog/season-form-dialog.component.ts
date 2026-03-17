import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { CategoriesService } from '@app/features/categories/categories.service';
import { Season, SeasonCreateDto } from '@app/core/models/season.model';
import { Category } from '@app/core/models/category.model';

@Component({
  selector: 'app-season-form-dialog',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './season-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 360px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class SeasonFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<SeasonFormDialogComponent>);
  private readonly categoriesService = inject(CategoriesService);
  readonly data = inject<Season | null>(MAT_DIALOG_DATA, { optional: true });
  readonly categories$: Observable<Category[]> = this.categoriesService.getAll();

  private get initialCategoryId(): string {
    const ac = this.data?.ageCategory;
    if (ac == null) return '';
    if (typeof ac === 'object') return (ac as Category)._id ?? '';
    return String(ac);
  }

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', Validators.required],
    ageCategory: [this.initialCategoryId, Validators.required],
    startDate: [this.data?.startDate ? new Date(this.data.startDate) : null as Date | null, Validators.required],
    endDate: [this.data?.endDate ? new Date(this.data.endDate) : null as Date | null, Validators.required],
    isActive: [this.data?.isActive ?? false],
  });

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: SeasonCreateDto & { _id?: string } = {
      name: v.name,
      ageCategory: v.ageCategory,
      startDate: v.startDate ? new Date(v.startDate).toISOString() : '',
      endDate: v.endDate ? new Date(v.endDate).toISOString() : '',
      isActive: v.isActive,
    };
    if (this.data?._id) dto._id = this.data._id;
    this.ref.close(dto);
  }
}
