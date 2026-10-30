import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../core/auth.service';
import { LANGS, LangService } from '../core/lang.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe],
  template: `
    <div class="flex min-h-screen flex-col">
      <!-- Desktop: horizontal top bar. Mobile: compact header + bottom tab bar. -->
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <a routerLink="/dashboard" class="text-lg font-bold text-brand-600">UniFlow</a>

          <nav class="ml-6 hidden gap-1 md:flex">
            @for (n of nav; track n.path) {
              <a
                [routerLink]="n.path"
                routerLinkActive="bg-brand-50 text-brand-700"
                class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >{{ n.key | transloco }}</a
              >
            }
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <select
              class="input !w-auto !py-1.5"
              [value]="lang.active"
              (change)="lang.set($any($event.target).value)"
              [attr.aria-label]="'lang.label' | transloco"
            >
              @for (l of langs; track l.code) {
                <option [value]="l.code">{{ l.label }}</option>
              }
            </select>
            <span class="hidden text-sm text-slate-500 sm:inline">{{ auth.user() }}</span>
            <button class="btn btn-secondary !px-3 !py-1.5" (click)="logout()">{{ 'nav.logout' | transloco }}</button>
          </div>
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 md:pb-8">
        <router-outlet />
      </main>

      <nav
        class="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white md:hidden"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        @for (n of mobileNav; track n.path) {
          <a
            [routerLink]="n.path"
            routerLinkActive="text-brand-600 font-semibold"
            class="flex flex-col items-center gap-0.5 py-2 text-xs text-slate-500"
          >
            <span class="text-lg" aria-hidden="true">{{ n.icon }}</span>
            {{ n.key | transloco }}
          </a>
        }
      </nav>
    </div>
  `,
})
export class Shell {
  auth = inject(AuthService);
  lang = inject(LangService);
  private router = inject(Router);
  langs = LANGS;

  nav = [
    { path: '/dashboard', key: 'nav.dashboard', icon: '📊' },
    { path: '/materials', key: 'nav.materials', icon: '📦' },
    { path: '/coworkers', key: 'nav.coworkers', icon: '👥' },
    { path: '/actions', key: 'nav.actions', icon: '📷' },
  ];
  mobileNav = this.nav;

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
