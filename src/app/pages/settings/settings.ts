import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { LANGS, LangService } from '../../core/lang.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'settings.title' | transloco }}</h1>

    <div class="max-w-2xl space-y-6">
      <!-- Language settings card -->
      <section class="card space-y-4">
        <div>
          <h2 class="text-lg font-semibold">{{ 'settings.language' | transloco }}</h2>
          <p class="text-sm text-slate-500">{{ 'settings.languageDesc' | transloco }}</p>
        </div>

        <div class="grid gap-2 sm:grid-cols-3">
          @for (l of langs; track l.code) {
            <button
              type="button"
              class="flex items-center justify-between rounded-lg border p-3 text-left transition"
              [class]="
                lang.active === l.code
                  ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              "
              (click)="lang.set(l.code)"
            >
              <span>{{ l.label }}</span>
              @if (lang.active === l.code) {
                <span class="font-bold text-brand-600" aria-hidden="true">✔</span>
              }
            </button>
          }
        </div>
      </section>

      <!-- Account info card -->
      @if (auth.user(); as u) {
        <section class="card space-y-3">
          <h2 class="text-lg font-semibold">{{ 'settings.account' | transloco }}</h2>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">{{ 'materials.name' | transloco }}</span>
              <span class="font-medium text-slate-900">{{ u.name }}</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-slate-500">{{ 'login.email' | transloco }}</span>
              <span class="font-mono text-xs text-slate-900">{{ u.email }}</span>
            </div>
            <div class="flex items-center justify-between pt-1">
              <span class="text-slate-500">{{ 'settings.role' | transloco }}</span>
              <span class="badge bg-brand-100 font-semibold text-brand-700">
                {{ 'role.' + u.role | transloco }}
              </span>
            </div>
          </div>
        </section>
      }

      <!-- Demo data card (admin only) -->
      @if (auth.isAdmin()) {
        <section class="card flex items-center justify-between gap-4">
          <button type="button" class="btn btn-secondary" (click)="data.resetDemo()">
            {{ 'common.resetDemo' | transloco }}
          </button>
        </section>
      }

      <!-- About card -->
      <section class="card space-y-2 text-sm text-slate-500">
        <h2 class="text-base font-semibold text-slate-800">{{ 'settings.about' | transloco }}</h2>
        <p>UniFlow POC &bull; {{ 'settings.version' | transloco }} 0.1.0</p>
      </section>
    </div>
  `,
})
export class Settings {
  auth = inject(AuthService);
  data = inject(DataService);
  lang = inject(LangService);
  langs = LANGS;
}
