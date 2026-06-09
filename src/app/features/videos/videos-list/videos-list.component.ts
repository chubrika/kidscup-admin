import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { VideosService } from '../videos.service';
import { Video } from '@app/core/models/video.model';
import { VideoFormDialogComponent } from '../video-form-dialog/video-form-dialog.component';
import { ConfirmDialogComponent } from '@app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-videos-list',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule],
  templateUrl: './videos-list.component.html',
  styles: [`
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    .description-cell {
      max-width: 240px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .status-chip {
      text-transform: capitalize;
    }
  `],
})
export class VideosListComponent implements OnInit {
  private readonly videosService = inject(VideosService);
  private readonly dialog = inject(MatDialog);
  readonly dataSource = new MatTableDataSource<Video>([]);
  readonly displayedColumns = ['title', 'category', 'status', 'youtubeId', 'actions'];

  ngOnInit(): void {
    this.refresh();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(VideoFormDialogComponent, { width: '560px', data: null });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.videosService.create(result).subscribe(() => this.refresh());
      }
    });
  }

  openEditDialog(video: Video): void {
    const ref = this.dialog.open(VideoFormDialogComponent, { width: '560px', data: video });
    ref.afterClosed().subscribe((result) => {
      if (result?._id) {
        const { _id, ...dto } = result;
        this.videosService.update(_id, dto).subscribe(() => this.refresh());
      }
    });
  }

  confirmDelete(video: Video): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'წაშლა', message: `გსურთ "${video.title}" წაშლა?` },
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) this.videosService.delete(video._id).subscribe(() => this.refresh());
    });
  }

  private refresh(): void {
    this.videosService.getAll().subscribe((list) => (this.dataSource.data = list));
  }
}
