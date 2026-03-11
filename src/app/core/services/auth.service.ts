import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  token: string;
}

interface BackendAuthResponse {
  token: string;
  user: { id: unknown; email: string; name?: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'kidscup_admin_token';
  private readonly userKey = 'kidscup_admin_user';

  private readonly currentUserSignal = signal<AuthUser | null>(this.loadStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  login(credentials: LoginCredentials): Observable<AuthUser> {
    return this.api.post<BackendAuthResponse>('/auth/login', credentials).pipe(
      map((res) => ({
        id: String(res.user.id),
        email: res.user.email,
        name: res.user.name,
        token: res.token,
      })),
      tap((user) => this.setUser(user)),
    );
  }

  private setUser(user: AuthUser): void {
    this.currentUserSignal.set(user);
    if (user.token) {
      localStorage.setItem(this.tokenKey, user.token);
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.router.navigate(['/login']);
  }

  private loadStoredUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem(this.userKey);
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
