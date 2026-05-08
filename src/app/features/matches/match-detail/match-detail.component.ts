import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Editor, NgxEditorComponent, NgxEditorMenuComponent } from 'ngx-editor';
import { MatchesService } from '../matches.service';
import { Match, MatchStatus } from '../../../core/models/match.model';
import { LiveScoringComponent } from '../live-scoring/live-scoring.component';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    LiveScoringComponent,
    NgxEditorComponent,
    NgxEditorMenuComponent,
  ],
  templateUrl: './match-detail.component.html',
  styles: [`
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .page-title { flex: 1; margin: 0; font-size: 1.5rem; }
    .score-card .score-row { display: flex; align-items: center; justify-content: space-between; gap: 24px; font-size: 1.25rem; }
    .score { font-weight: 700; font-size: 1.5rem; }
    .meta, .status { color: #64748b; margin: 8px 0 0; }
    form { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
    .placeholder { color: #94a3b8; }
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
      min-height: 180px;
      background: #fff;
    }
    .match-editor-wrapper:focus-within {
      border-color: var(--mat-form-field-outline-color, #1976d2);
      border-width: 2px;
    }
    .match-editor-wrapper ::ng-deep .NgxEditor {
      min-height: 160px;
    }
    .match-editor-wrapper ::ng-deep .NgxEditor__Content {
      min-height: 160px;
    }
  `],
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly matchesService = inject(MatchesService);
  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly match = signal<Match | null>(null);

  readonly statusOptions: { value: MatchStatus; label: string }[] = [
    { value: 'scheduled', label: 'დაგეგმილი' },
    { value: 'live', label: 'Live' },
    { value: 'finished', label: 'დასრულებული' },
    { value: 'postponed', label: 'გადატოვებული' },
    { value: 'cancelled', label: 'გაუქმებული' },
  ];

  readonly detailsForm = this.fb.nonNullable.group({
    date: ['', Validators.required],
    time: ['', Validators.required],
    status: ['scheduled' as MatchStatus, Validators.required],
  });

  readonly scoreForm = this.fb.nonNullable.group({
    scoreHome: [0],
    scoreAway: [0],
  });

  editor: Editor | null = null;

  readonly refereesForm = this.fb.nonNullable.group({
    refereesInfo: [''],
  });

  ngOnInit(): void {
    this.editor = new Editor();
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.matchesService.getById(id).subscribe((m) => {
      if (m) {
        this.match.set(m);
        this.detailsForm.patchValue({
          date: m.date ?? '',
          time: m.time ?? '',
          status: (m.status ?? 'scheduled') as MatchStatus,
        });
        this.scoreForm.patchValue({
          scoreHome: m.scoreHome ?? 0,
          scoreAway: m.scoreAway ?? 0,
        });
        this.refereesForm.patchValue({
          refereesInfo: m.refereesInfo ?? '',
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  saveDetails(): void {
    const m = this.match();
    if (!m) return;
    if (this.detailsForm.invalid) return;
    const v = this.detailsForm.getRawValue();
    this.matchesService.update(m._id, { date: v.date, time: v.time, status: v.status }).subscribe((updated) => {
      this.match.set(updated);
    });
  }

  saveScore(): void {
    const m = this.match();
    if (!m) return;
    const v = this.scoreForm.getRawValue();
    this.matchesService.update(m._id, { scoreHome: v.scoreHome, scoreAway: v.scoreAway }).subscribe((updated) => {
      this.match.set(updated);
    });
  }

  saveRefereesInfo(): void {
    const m = this.match();
    if (!m) return;
    const v = this.refereesForm.getRawValue();
    this.matchesService.update(m._id, { refereesInfo: v.refereesInfo }).subscribe((updated) => {
      this.match.set(updated);
      this.refereesForm.patchValue({ refereesInfo: updated.refereesInfo ?? '' });
    });
  }
}
