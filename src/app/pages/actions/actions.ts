import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionError, ActionType } from '../../core/models';
import { DataService } from '../../core/data.service';
import { BarcodeInput } from '../../shared/barcode-input';

type FlowAction = Exclude<ActionType, 'registry'>;

interface Feedback {
  ok: boolean;
  error?: ActionError;
  item?: string;
  barcode?: string;
  coworker?: string;
}

@Component({
  selector: 'app-actions',
  imports: [FormsModule, TranslocoPipe, BarcodeInput],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'actions.title' | transloco }}</h1>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card space-y-4">
        <div class="grid grid-cols-2 gap-2">
          @for (a of actions; track a.type) {
            <button
              type="button"
              class="rounded-lg border p-3 text-left text-sm transition"
              [class]="type() === a.type ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600' : 'border-slate-200 hover:bg-slate-50'"
              (click)="select(a.type)"
            >
              <span class="block text-xl" aria-hidden="true">{{ a.icon }}</span>
              <span class="block font-semibold">{{ a.key | transloco }}</span>
              <span class="block text-xs text-slate-500">{{ a.key + 'Desc' | transloco }}</span>
            </button>
          }
        </div>

        @if (type() === 'checkout') {
          <label class="block text-sm font-medium">
            {{ 'actions.coworker' | transloco }}
            <select class="input mt-1" [ngModel]="coworkerId()" (ngModelChange)="coworkerId.set($event)">
              <option value="">{{ 'actions.selectCoworker' | transloco }}</option>
              @for (c of data.coworkers(); track c.id) {
                <option [value]="c.id">{{ c.name }} ({{ c.barcode }})</option>
              }
            </select>
          </label>
        }

        <div>
          <p class="mb-2 text-sm font-medium">{{ 'actions.scan' | transloco }}</p>
          <app-barcode-input (scanned)="run($event)" />
        </div>
      </section>

      <section class="card">
        <h2 class="mb-3 text-lg font-semibold">{{ 'actions.lastResult' | transloco }}</h2>
        @if (feedback(); as f) {
          @if (f.ok) {
            <div class="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              <p class="font-semibold">✔ {{ 'actions.success' | transloco }}</p>
              <p class="mt-1">{{ f.item }} <span class="font-mono text-xs">{{ f.barcode }}</span></p>
              @if (f.coworker) { <p>{{ f.coworker }}</p> }
            </div>
          } @else {
            <div class="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              <p class="font-semibold">✖ {{ 'actions.error.' + f.error | transloco }}</p>
            </div>
          }
        } @else {
          <p class="text-sm text-slate-400">{{ 'actions.noResult' | transloco }}</p>
        }
      </section>
    </div>
  `,
})
export class Actions {
  data = inject(DataService);
  type = signal<FlowAction>('checkout');
  coworkerId = signal('');
  feedback = signal<Feedback | null>(null);

  actions: { type: FlowAction; key: string; icon: string }[] = [
    { type: 'checkout', key: 'actions.checkout', icon: '⬆️' },
    { type: 'checkin', key: 'actions.checkin', icon: '⬇️' },
    { type: 'laundry-in', key: 'actions.laundryIn', icon: '🧺' },
    { type: 'laundry-out', key: 'actions.laundryOut', icon: '✅' },
  ];

  select(t: FlowAction) {
    this.type.set(t);
    this.feedback.set(null);
  }

  run(barcode: string) {
    const res = this.data.perform(this.type(), barcode, this.coworkerId() || undefined);
    this.feedback.set(
      res.ok
        ? { ok: true, item: res.material.name, barcode: res.material.barcode, coworker: res.coworker?.name }
        : { ok: false, error: res.error },
    );
  }
}
