import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent } from 'ngx-editor';
import { Match, MatchCreateDto, MatchStatus } from '@app/core/models/match.model';
import { TeamsService } from '@app/features/teams/teams.service';
import { Team } from '@app/core/models/team.model';
import { CategoriesService } from '@app/features/categories/categories.service';
import { Category } from '@app/core/models/category.model';
import { SeasonService } from '@app/core/services/season.service';
import { Season } from '@app/core/models/season.model';

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
    NgxEditorComponent,
    NgxEditorMenuComponent,
  ],
  templateUrl: './match-form-dialog.component.html',
  styles: [`
    form { display: flex; flex-direction: column; min-width: 400px; }
    mat-dialog-content { display: flex; flex-direction: column; gap: 8px; }
    .match-editor-label {
      display: block;
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      margin-bottom: 4px;
      font-weight: 500;
    }
    .match-editor-wrapper {
      border: 1px solid rgba(0, 0, 0, 0.38);
      border-radius: 4px;
      overflow: hidden;
      min-height: 140px;
    }
    .match-editor-wrapper:focus-within {
      border-color: var(--mat-form-field-outline-color, #1976d2);
      border-width: 2px;
    }
    .match-editor-wrapper ::ng-deep .NgxEditor {
      min-height: 120px;
    }
    .match-editor-wrapper ::ng-deep .NgxEditor__Content {
      min-height: 120px;
    }
  `],
})
export class MatchFormDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<MatchFormDialogComponent>);
  private readonly teamsService = inject(TeamsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly seasonService = inject(SeasonService);
  readonly data = inject<Match | null>(MAT_DIALOG_DATA, { optional: true });
  readonly teams = signal<Team[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly seasons = signal<Season[]>([]);

  editor: Editor | null = null;

  private get initialCategoryId(): string {
    const ac = this.data?.ageCategory;
    if (ac == null) return '';
    if (typeof ac === 'object') return (ac as { id?: string; _id?: string }).id ?? (ac as { id?: string; _id?: string })._id ?? '';
    return String(ac);
  }

  private get initialSeasonId(): string {
    const s = (this.data as Match & { season?: Season | string })?.season;
    if (s == null) return '';
    if (typeof s === 'object') return (s as Season)._id ?? '';
    return String(s);
  }

  readonly form = this.fb.nonNullable.group({
    homeTeamId: [this.data?.homeTeamId ?? '', Validators.required],
    awayTeamId: [this.data?.awayTeamId ?? '', Validators.required],
    date: [this.data?.date ?? '', Validators.required],
    time: [this.data?.time ?? '12:00', Validators.required],
    location: [this.data?.location ?? '', Validators.required],
    ageCategory: [this.initialCategoryId, Validators.required],
    seasonId: [this.initialSeasonId, Validators.required],
    refereesInfo: [this.data?.refereesInfo ?? ''],
    status: [this.data?.status ?? 'scheduled' as MatchStatus, Validators.required],
    scoreHome: [this.data?.scoreHome ?? 0],
    scoreAway: [this.data?.scoreAway ?? 0],
  });

  ngOnInit(): void {
    this.editor = new Editor();
    this.teamsService.getAll().subscribe((t) => this.teams.set(t));
    this.categoriesService.getAll().subscribe((c) => this.categories.set(c));
    const catId = this.form.getRawValue().ageCategory;
    if (catId) this.loadSeasonsByCategory(catId);
    this.form.get('ageCategory')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ seasonId: '' });
      if (id) this.loadSeasonsByCategory(id); else this.seasons.set([]);
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private loadSeasonsByCategory(ageCategoryId: string): void {
    this.seasonService.getSeasons({ ageCategory: ageCategoryId }).subscribe((list) => this.seasons.set(list));
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
      seasonId: v.seasonId,
      refereesInfo: v.refereesInfo,
      status: v.status,
      scoreHome: v.scoreHome,
      scoreAway: v.scoreAway,
    };
    if (this.data?.id) dto.id = this.data.id;
    this.ref.close(dto);
  }
}
