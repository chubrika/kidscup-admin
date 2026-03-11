import { Routes } from '@angular/router';
import { TeamsListComponent } from './teams-list/teams-list.component';
import { TeamDetailComponent } from './team-detail/team-detail.component';

export const teamsRoutes: Routes = [
  { path: '', component: TeamsListComponent },
  { path: ':id', component: TeamDetailComponent },
];
