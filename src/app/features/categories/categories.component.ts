import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesService } from './categories.service';
import { Category } from '../../core/models/category.model';
import { CategoryFormDialogComponent } from './category-form-dialog/category-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './categories.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
  `],
})
export class CategoriesComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Category>([]);
  readonly displayedColumns = ['name', 'ageRange', 'description', 'actions'];

  ngOnInit(): void {
    this.categoriesService.getAll().subscribe((list) => (this.dataSource.data = list));
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, { width: '400px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        if (result.id) {
          this.categoriesService.update(result.id, result).subscribe(() => this.refresh());
        } else {
          this.categoriesService.create(result).subscribe(() => this.refresh());
        }
      }
    });
  }

  openEditDialog(cat: Category): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, { width: '400px', data: cat });
    ref.afterClosed().subscribe((result) => {
      if (result?.id) this.categoriesService.update(result.id, result).subscribe(() => this.refresh());
    });
  }

  confirmDelete(cat: Category): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Category', message: `Delete "${cat.name}"?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.categoriesService.delete(cat.id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.categoriesService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
