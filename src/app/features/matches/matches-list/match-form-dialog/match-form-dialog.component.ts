import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Match, MatchCreateDto, MatchStatus } from '@app/core/models/match.model';
import { TeamsService } from '@app/features/teams/teams.service';
import { Team } from '@app/core/models/team.model';
import { CategoriesService } from '@app/core/services/categories.service';
import { Category } from '@app/core/models/category.model';

@Component({
  selector: 'app-match-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './match-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 400px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
  `],
})
export class MatchFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<MatchFormDialogComponent>);
  private readonly teamsService = inject(TeamsService);
  private readonly categoriesService = inject(CategoriesService);
  readonly data = inject<Match | null>(MAT_DIALOG_DATA, { optional: true });
  readonly teams = signal<Team[]>([]);
  readonly categories = signal<Category[]>([]);

  private get initialCategoryId(): string {
    const ac = this.data?.ageCategory;
    if (ac == null) return '';
    if (typeof ac === 'object') return (ac as { id?: string; _id?: string }).id ?? (ac as { id?: string; _id?: string })._id ?? '';
    return String(ac);
  }

  readonly form = this.fb.nonNullable.group({
    homeTeamId: [this.data?.homeTeamId ?? '', Validators.required],
    awayTeamId: [this.data?.awayTeamId ?? '', Validators.required],
    date: [this.data?.date ?? '', Validators.required],
    time: [this.data?.time ?? '12:00', Validators.required],
    location: [this.data?.location ?? '', Validators.required],
    ageCategory: [this.initialCategoryId, Validators.required],
    status: [this.data?.status ?? 'scheduled' as MatchStatus, Validators.required],
    scoreHome: [this.data?.scoreHome ?? 0],
    scoreAway: [this.data?.scoreAway ?? 0],
  });

  ngOnInit(): void {
    this.teamsService.getAll().subscribe((t) => this.teams.set(t));
    this.categoriesService.getCategories().subscribe((c) => this.categories.set(c));
  }

  teamId(team: Team): string {
    return (team as { id?: string; _id: string }).id ?? team._id;
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const dto: MatchCreateDto & { id?: string } = {
      homeTeamId: v.homeTeamId,
      awayTeamId: v.awayTeamId,
      date: v.date,
      time: v.time,
      location: v.location,
      ageCategory: v.ageCategory,
      status: v.status,
      scoreHome: v.scoreHome,
      scoreAway: v.scoreAway,
    };
    if (this.data?.id) dto.id = this.data.id;
    this.ref.close(dto);
  }
}
