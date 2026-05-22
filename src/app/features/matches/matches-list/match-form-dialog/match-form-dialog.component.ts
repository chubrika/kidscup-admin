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
import { GroupsService } from '@app/features/groups/groups.service';
import { Group } from '@app/core/models/group.model';
import { RoundsService } from '@app/features/rounds/rounds.service';
import { Round } from '@app/core/models/round.model';

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
    .hint { font-size: 0.75rem; color: rgba(0,0,0,0.6); margin: 0; }
  `],
})
export class MatchFormDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<MatchFormDialogComponent>);
  private readonly teamsService = inject(TeamsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly seasonService = inject(SeasonService);
  private readonly groupsService = inject(GroupsService);
  private readonly roundsService = inject(RoundsService);
  readonly data = inject<Match | null>(MAT_DIALOG_DATA, { optional: true });
  readonly allTeams = signal<Team[]>([]);
  readonly filteredTeams = signal<Team[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly seasons = signal<Season[]>([]);
  readonly groups = signal<Group[]>([]);
  readonly rounds = signal<Round[]>([]);

  editor: Editor | null = null;

  private get initialCategoryId(): string {
    const ac = this.data?.ageCategory;
    if (ac == null) return '';
    if (typeof ac === 'object') return (ac as { id?: string; _id?: string }).id ?? (ac as { id?: string; _id?: string })._id ?? '';
    return String(ac);
  }

  private get initialSeasonId(): string {
    const s = (this.data as Match & { season?: Season | string })?.season;
    if (s == null) return this.data?.seasonId ?? '';
    if (typeof s === 'object') return (s as Season)._id ?? '';
    return String(s);
  }

  private get initialGroupId(): string {
    const g = this.data?.group ?? this.data?.groupId;
    if (g == null) return '';
    if (typeof g === 'object') return g._id ?? '';
    return String(g);
  }

  private get initialRoundId(): string {
    const r = this.data?.round ?? this.data?.roundId;
    if (r == null) return '';
    if (typeof r === 'object') return r._id ?? '';
    return String(r);
  }

  readonly form = this.fb.nonNullable.group({
    groupId: [this.initialGroupId, Validators.required],
    roundId: [this.initialRoundId],
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
    this.teamsService.getAll().subscribe((t) => {
      this.allTeams.set(t);
      this.applyTeamFilter();
    });
    this.categoriesService.getAll().subscribe((c) => this.categories.set(c));
    const catId = this.form.getRawValue().ageCategory;
    const seasonId = this.form.getRawValue().seasonId;
    if (catId) this.loadSeasonsByCategory(catId);
    if (seasonId) this.loadGroupsBySeason(seasonId);
    const groupId = this.form.getRawValue().groupId;
    if (groupId) this.loadRoundsByGroup(groupId);

    this.form.get('ageCategory')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ seasonId: '', groupId: '', roundId: '', homeTeamId: '', awayTeamId: '' });
      if (id) this.loadSeasonsByCategory(id);
      else this.seasons.set([]);
      this.groups.set([]);
      this.rounds.set([]);
      this.applyTeamFilter();
    });
    this.form.get('seasonId')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ groupId: '', roundId: '', homeTeamId: '', awayTeamId: '' });
      if (id) this.loadGroupsBySeason(id);
      else this.groups.set([]);
      this.rounds.set([]);
      this.applyTeamFilter();
    });
    this.form.get('groupId')?.valueChanges.subscribe((id) => {
      this.form.patchValue({ roundId: '', homeTeamId: '', awayTeamId: '' });
      if (id) this.loadRoundsByGroup(id);
      else this.rounds.set([]);
      this.applyTeamFilter();
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private loadSeasonsByCategory(ageCategoryId: string): void {
    this.seasonService.getSeasons({ ageCategory: ageCategoryId }).subscribe((list) => this.seasons.set(list));
  }

  private loadGroupsBySeason(seasonId: string): void {
    const ageCategory = this.form.getRawValue().ageCategory;
    this.groupsService.getAll({ seasonId, ageCategory: ageCategory || undefined }).subscribe((list) => this.groups.set(list));
  }

  private loadRoundsByGroup(groupId: string): void {
    this.roundsService.getAll(groupId).subscribe((list) => this.rounds.set(list));
  }

  private teamGroupId(team: Team): string {
    const g = team.group;
    if (!g) return '';
    return typeof g === 'string' ? g : g._id;
  }

  private applyTeamFilter(): void {
    const { groupId, ageCategory, seasonId } = this.form.getRawValue();
    let list = this.allTeams();
    if (ageCategory) {
      list = list.filter((t) => {
        const ac = t.ageCategory;
        const id = typeof ac === 'string' ? ac : ac?._id;
        return id === ageCategory;
      });
    }
    if (seasonId) {
      list = list.filter((t) => {
        const s = t.season;
        if (!s) return true;
        const id = typeof s === 'string' ? s : s._id;
        return id === seasonId;
      });
    }
    if (groupId) {
      list = list.filter((t) => {
        const gid = this.teamGroupId(t);
        return !gid || gid === groupId;
      });
    }
    this.filteredTeams.set(list);
  }

  teamId(team: Team): string {
    return (team as { id?: string; _id: string }).id ?? team._id;
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (v.homeTeamId === v.awayTeamId) return;
    const dto: MatchCreateDto & { id?: string } = {
      homeTeamId: v.homeTeamId,
      awayTeamId: v.awayTeamId,
      date: v.date,
      time: v.time,
      location: v.location,
      ageCategory: v.ageCategory,
      seasonId: v.seasonId,
      groupId: v.groupId,
      roundId: v.roundId || undefined,
      refereesInfo: v.refereesInfo,
      status: v.status,
      scoreHome: v.scoreHome,
      scoreAway: v.scoreAway,
    };
    if (this.data?.id) dto.id = this.data.id;
    this.ref.close(dto);
  }
}
