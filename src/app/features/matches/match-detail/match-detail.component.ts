import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService } from '../matches.service';
import { Match } from '../../../core/models/match.model';

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
  `],
})
export class MatchDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly matchesService = inject(MatchesService);
  private readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly match = signal<Match | null>(null);
  readonly scoreForm = this.fb.nonNullable.group({
    scoreHome: [0],
    scoreAway: [0],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.matchesService.getById(id).subscribe((m) => {
      console.log(m)
      if (m) {
        this.match.set(m);
        this.scoreForm.patchValue({
          scoreHome: m.scoreHome ?? 0,
          scoreAway: m.scoreAway ?? 0,
        });
      }
    });
  }

  saveScore(): void {
    const m = this.match();
    if (!m) return;
    const v = this.scoreForm.getRawValue();
    this.matchesService.update(m.id, { scoreHome: v.scoreHome, scoreAway: v.scoreAway }).subscribe((updated) => {
      this.match.set(updated);
    });
  }
}
