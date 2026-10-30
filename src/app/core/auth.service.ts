import { Injectable, signal } from '@angular/core';

const KEY = 'uniflow.user';

/** Demo-only auth: a user name, no password, kept in localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<string | null>(this.read());

  login(name: string) {
    const clean = name.trim();
    if (!clean) return false;
    this.user.set(clean);
    try {
      localStorage.setItem(KEY, clean);
    } catch {}
    return true;
  }

  logout() {
    this.user.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }

  private read(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
}
