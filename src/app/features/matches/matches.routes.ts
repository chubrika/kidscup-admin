import { Routes } from '@angular/router';
import { MatchesListComponent } from './matches-list/matches-list.component';
import { MatchDetailComponent } from './match-detail/match-detail.component';
import { LiveMatchesComponent } from './live-matches/live-matches.component';

export const matchesRoutes: Routes = [
  { path: '', component: MatchesListComponent },
  { path: 'live', component: LiveMatchesComponent },
  { path: ':id', component: MatchDetailComponent },
];
