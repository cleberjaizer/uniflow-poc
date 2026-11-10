import { Injectable, computed, signal } from '@angular/core';
import { ALLOWED_USERS, AuthUser, UserRole } from './models';

const KEY = 'uniflow.user.v2';

/** Demo auth with hardcoded users and role-based privileges. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<AuthUser | null>(this.read());
  readonly role = computed(() => this.user()?.role ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');

  hasRole(roles: UserRole[]): boolean {
    const current = this.role();
    return current !== null && roles.includes(current);
  }

  login(emailInput: string): boolean {
    const clean = emailInput.trim().toLowerCase();
    if (!clean) return false;
    const found = ALLOWED_USERS.find((u) => u.email.toLowerCase() === clean);
    if (!found) return false;

    this.user.set(found);
    try {
      localStorage.setItem(KEY, JSON.stringify(found));
    } catch {}
    return true;
  }

  logout() {
    this.user.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }

  private read(): AuthUser | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        const matched = ALLOWED_USERS.find(
          (u) => u.email.toLowerCase() === parsed?.email?.toLowerCase(),
        );
        if (matched) return matched;
      }
    } catch {}
    return null;
  }
}
