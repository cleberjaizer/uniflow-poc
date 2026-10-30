import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { LANGS, LangService } from '../../core/lang.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <form class="card w-full max-w-sm space-y-5 p-6" (ngSubmit)="login()">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-brand-600">UniFlow</h1>
          <p class="mt-1 text-sm text-slate-500">{{ 'login.subtitle' | transloco }}</p>
        </div>

        <label class="block text-sm font-medium">
          {{ 'login.username' | transloco }}
          <input class="input mt-1" name="user" autocomplete="username" autofocus [(ngModel)]="name" required />
        </label>

        <button class="btn btn-primary w-full" type="submit" [disabled]="!name.trim()">
          {{ 'login.button' | transloco }}
        </button>

        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>{{ 'login.demoNote' | transloco }}</span>
          <select class="rounded border border-slate-200 bg-white px-1 py-0.5" [value]="lang.active" (change)="lang.set($any($event.target).value)">
            @for (l of langs; track l.code) {
              <option [value]="l.code">{{ l.label }}</option>
            }
          </select>
        </div>
      </form>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  lang = inject(LangService);
  langs = LANGS;
  name = '';

  login() {
    if (this.auth.login(this.name)) this.router.navigate(['/dashboard']);
  }
}
