import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { StandingsService } from './standings.service';
import { CategoriesService } from '../../core/services/categories.service';
import { StandingRow, TeamStanding } from '../../core/models/standing.model';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './standings.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 16px; }
    .category-filter { width: 160px; }
    .full-width { width: 100%; }
    .category-title { margin-top: 24px; margin-bottom: 8px; }
    .category-title:first-of-type { margin-top: 0; }
  `],
})
export class StandingsComponent implements OnInit {
  private readonly standingsService = inject(StandingsService);
  private readonly categoriesService = inject(CategoriesService);
  readonly standings = signal<StandingRow[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCategory = signal<string>('');
  readonly displayedColumns = ['position', 'teamName', 'played', 'wins', 'losses', 'points'];

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe((list) => this.categories.set(list));
    this.load();
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.load();
  }

  private load(): void {
    this.standingsService.getByCategory(this.selectedCategory() || undefined).subscribe((s) => {
      const list = s?.length ? s : [];
      this.standings.set(list);
    });
  }
}
