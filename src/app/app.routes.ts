import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes) },
      { path: 'teams', loadChildren: () => import('./features/teams/teams.routes').then(m => m.teamsRoutes) },
      { path: 'players', loadChildren: () => import('./features/players/players.routes').then(m => m.playersRoutes) },
      { path: 'matches', loadChildren: () => import('./features/matches/matches.routes').then(m => m.matchesRoutes) },
      { path: 'standings', loadChildren: () => import('./features/standings/standings.routes').then(m => m.standingsRoutes) },
      { path: 'seasons', loadChildren: () => import('./features/seasons/seasons.routes').then(m => m.seasonsRoutes) },
      { path: 'categories', loadChildren: () => import('./features/categories/categories.routes').then(m => m.categoriesRoutes) },
      { path: 'media', loadChildren: () => import('./features/media/media.routes').then(m => m.mediaRoutes) },
      { path: 'news', loadChildren: () => import('./features/news/news.routes').then(m => m.newsRoutes) },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
