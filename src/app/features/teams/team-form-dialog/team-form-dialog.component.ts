import { Component, inject, OnInit } from '@angular/core';
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
  `],
})
export class TeamFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<TeamFormDialogComponent>);
  private readonly categoriesService = inject(CategoriesService);
  readonly data = inject<Team | null>(MAT_DIALOG_DATA, { optional: true });

  categories: Category[] = [];

  readonly form = this.fb.nonNullable.group({
    name: [this.data?.name ?? '', Validators.required],
    city: [this.data?.city ?? '', Validators.required],
    coachName: [this.data?.coachName ?? '', Validators.required],
    ageCategory: [this.getAgeCategoryId(this.data) ?? '', Validators.required],
    logo: [this.data?.logo ?? ''],
  });

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe((list) => {
      this.categories = list;
      const current = this.form.get('ageCategory')?.value;
      if ((current === '' || current == null) && list.length > 0) {
        this.form.patchValue({ ageCategory: list[0]._id });
      }
    });
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
    };
    if (this.data?._id) dto.id = this.data._id;
    this.ref.close(dto);
  }
}
