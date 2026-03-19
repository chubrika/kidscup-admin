import { Component, inject, OnInit } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatchesService } from '../matches.service';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-live-matches',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './live-matches.component.html',
  styles: [`
    mat-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .full-width { width: 100%; }
    a { color: #2563eb; text-decoration: none; }
  `],
})
export class LiveMatchesComponent implements OnInit {
  private readonly matchesService = inject(MatchesService);
  readonly dataSource = new MatTableDataSource<Match>([]);
  readonly displayedColumns = ['date', 'match', 'location', 'score', 'actions'];

  ngOnInit(): void {
    this.matchesService.getLive().subscribe((list) => (this.dataSource.data = list));
  }
}

