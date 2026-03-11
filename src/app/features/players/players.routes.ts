import { Routes } from '@angular/router';
import { PlayersListComponent } from './players-list/players-list.component';
import { PlayerDetailComponent } from './player-detail/player-detail.component';

export const playersRoutes: Routes = [
  { path: '', component: PlayersListComponent },
  { path: ':id', component: PlayerDetailComponent },
];
