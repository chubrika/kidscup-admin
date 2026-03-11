import { Routes } from '@angular/router';
import { MatchesListComponent } from './matches-list/matches-list.component';
import { MatchDetailComponent } from './match-detail/match-detail.component';

export const matchesRoutes: Routes = [
  { path: '', component: MatchesListComponent },
  { path: ':id', component: MatchDetailComponent },
];
