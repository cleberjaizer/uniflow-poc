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
      class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-slate-50 to-brand-100 p-4"
    >
      <!-- Ambient decorative background blobs -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl"
      ></div>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
      ></div>

      <form
        class="relative z-10 w-full max-w-sm space-y-6 rounded-2xl bg-white/90 p-6 shadow-xl ring-1 ring-slate-200/80 backdrop-blur-md sm:p-8"
        (ngSubmit)="login()"
      >
        <div class="text-center">
          <img
            src="icons/icon-192x192.png"
            alt="UniFlow"
            width="80"
            height="80"
            class="mx-auto mb-3 h-20 w-20 rounded-2xl shadow-md shadow-brand-600/20"
          />
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">
            Uni<span class="text-brand-600">Flow</span>
          </h1>
          <p class="mt-1 text-sm text-slate-500">{{ 'login.subtitle' | transloco }}</p>
        </div>

        <label class="block text-sm font-medium text-slate-700">
          {{ 'login.email' | transloco }}
          <div class="relative mt-1.5">
            <span
              aria-hidden="true"
              class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z"
                />
                <path
                  d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z"
                />
              </svg>
            </span>
            <input
              class="input py-2.5 pl-10"
              type="email"
              name="email"
              autocomplete="email"
              autofocus
              [placeholder]="'login.emailPlaceholder' | transloco"
              [ngModel]="email()"
              (ngModelChange)="setEmail($event)"
              required
            />
          </div>
        </label>

        @if (error()) {
          <div
            class="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            <span aria-hidden="true">✖</span>
            <span>{{ 'login.error.unauthorized' | transloco }}</span>
          </div>
        }

        <button
          class="btn btn-primary w-full py-2.5 text-base font-semibold shadow-sm shadow-brand-600/20"
          type="submit"
          [disabled]="!email().trim()"
        >
          {{ 'login.button' | transloco }}
        </button>

        <div class="pt-1 text-center">
          <span
            class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
          >
            {{ 'login.demoNote' | transloco }}
          </span>
        </div>
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
