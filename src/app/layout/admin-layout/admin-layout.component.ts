import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawerMode } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './admin-layout.component.html',
  styles: [`
    .layout-container {
      height: 100vh;
    }
    .sidebar {
      width: 260px;
      border-right: 1px solid rgba(0, 0, 0, 0.12);
    }
    .sidebar-header {
      padding: 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e40af;
    }
    .main-content {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .toolbar {
      background: #fff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .toolbar-spacer {
      flex: 1 1 auto;
    }
    .menu-btn {
      margin-right: 8px;
    }
    .user-email {
      font-size: 0.875rem;
      margin-right: 8px;
      color: #64748b;
    }
    .content {
      flex: 1;
      padding: 24px;
      background: #f8fafc;
    }
    a.active {
      background: #eff6ff;
      color: #1d4ed8;
    }
  `],
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isSmallScreen = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(
      map((r) => r.matches),
    ),
    { initialValue: false },
  );
  readonly sidenavOpened = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(
      map((r) => !r.matches),
    ),
    { initialValue: true },
  );
  readonly sidenavMode: () => MatDrawerMode = () => (this.isSmallScreen() ? 'over' : 'side');

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'გუნდი', route: '/teams', icon: 'groups' },
    { label: 'მოთამაშეები', route: '/players', icon: 'person' },
    { label: 'თამაშები', route: '/matches', icon: 'sports_esports' },
    { label: 'ცხრილები', route: '/standings', icon: 'leaderboard' },
    { label: 'ტურნირები', route: '/categories', icon: 'category' },
    { label: 'ფოტოები', route: '/media', icon: 'photo_library' },
  ];
}
