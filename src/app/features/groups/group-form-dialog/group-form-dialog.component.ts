import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Group, GroupFormResult } from '../../../core/models/group.model';
import { Season } from '../../../core/models/season.model';
import { Category } from '../../../core/models/category.model';
import { SeasonService } from '../../../core/services/season.service';
import { CategoriesService } from '../../../core/services/categories.service';

@Component({
  selector: 'app-group-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './group-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 360px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
    .hint { font-size: 0.75rem; color: rgba(0,0,0,0.6); margin: 0; }
  `],
})
export class GroupFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<GroupFormDialogComponent>);
  private readonly seasonService = inject(SeasonService);
  private readonly categoriesService = inject(CategoriesService);
  readonly data = inject<Group | null>(MAT_DIALOG_DATA, { optional: true });

  seasons: Season[] = [];
  categories: Category[] = [];

  private seasonId(): string {
    const s = this.data?.season;
    if (!s) return '';
    return typeof s === 'string' ? s : s._id;
  }

  private categoryId(): string {
    const c = this.data?.ageCategory;
    if (!c) return '';
    return typeof c === 'string' ? c : c._id;
  }

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', Validators.required],
    season: [this.seasonId(), Validators.required],
    ageCategory: [this.categoryId()],
    sortOrder: [this.data?.sortOrder ?? 0],
  });

  ngOnInit(): void {
    this.seasonService.getSeasons().subscribe((list) => (this.seasons = list));
    this.categoriesService.getAll().subscribe((list) => (this.categories = list));
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: GroupFormResult = {
      name: v.name,
      season: v.season,
      ageCategory: v.ageCategory || undefined,
      sortOrder: v.sortOrder,
    };
    if (this.data?._id) dto._id = this.data._id;
    this.ref.close(dto);
  }
}
