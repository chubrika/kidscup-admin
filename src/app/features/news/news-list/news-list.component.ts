import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { NewsService } from '../news.service';
import { News } from '@app/core/models/news.model';
import { NewsFormDialogComponent } from '../news-form-dialog/news-form-dialog.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './news-list.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .description-cell { max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `],
})
export class NewsListComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<News>([]);
  readonly displayedColumns = ['title', 'description', 'photoUrl', 'actions'];

  ngOnInit(): void {
    this.refresh();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(NewsFormDialogComponent, { width: '560px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.newsService.create(result).subscribe(() => this.refresh());
      }
    });
  }

  openEditDialog(news: News): void {
    const ref = this.dialog.open(NewsFormDialogComponent, { width: '560px', data: news });
    ref.afterClosed().subscribe((result) => {
      if (result?._id) this.newsService.update(result._id, result).subscribe(() => this.refresh());
    });
  }

  confirmDelete(news: News): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'წაშლა', message: `გსურთ "${news.title}" წაშლა?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.newsService.delete(news._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.newsService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
