import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <div
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4"
    >
      <form class="card w-full max-w-sm space-y-4 p-6" (ngSubmit)="login()">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-brand-600">UniFlow</h1>
          <p class="mt-1 text-sm text-slate-500">{{ 'login.subtitle' | transloco }}</p>
        </div>

        <label class="block text-sm font-medium">
          {{ 'login.email' | transloco }}
          <input
            class="input mt-1"
            type="email"
            name="email"
            autocomplete="email"
            autofocus
            [placeholder]="'login.emailPlaceholder' | transloco"
            [ngModel]="email()"
            (ngModelChange)="setEmail($event)"
            required
          />
        </label>

        @if (error()) {
          <div class="rounded-lg bg-red-50 p-2.5 text-xs text-red-700">
            {{ 'login.error.unauthorized' | transloco }}
          </div>
        }

        <button class="btn btn-primary w-full" type="submit" [disabled]="!email().trim()">
          {{ 'login.button' | transloco }}
        </button>

        <p class="text-center text-xs text-slate-400">
          {{ 'login.demoNote' | transloco }}
        </p>
      </form>
    </div>
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = signal('');
  error = signal(false);

  setEmail(val: string) {
    this.email.set(val);
    this.error.set(false);
  }

  login() {
    this.error.set(false);
    if (this.auth.login(this.email())) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set(true);
    }
  }
}
