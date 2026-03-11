import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { StandingsService } from './standings.service';
import { StandingRow } from '../../core/models/standing.model';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './standings.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 16px; }
    .category-filter { width: 160px; }
    .full-width { width: 100%; }
  `],
})
export class StandingsComponent implements OnInit {
  private readonly standingsService = inject(StandingsService);
  readonly standings = signal<StandingRow[]>([]);
  readonly selectedCategory = signal<string>('');
  readonly displayedColumns = ['position', 'teamName', 'played', 'wins', 'losses', 'points'];

  ngOnInit(): void {
    this.load();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.load();
  }

  private load(): void {
    this.standingsService.getByCategory(this.selectedCategory() || undefined).subscribe((s) => this.standings.set(s));
  }
}
