import { Component, inject, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionError, ActionType } from '../../core/models';
import { DataService } from '../../core/data.service';
import { BarcodeInput } from '../../shared/barcode-input';
import { ActionDef, ActionSelector } from './action-selector';

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
  imports: [TranslocoPipe, BarcodeInput, ActionSelector],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'actions.title' | transloco }}</h1>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="card space-y-4">
        <!-- Collapsible action selector — auto-collapses when camera is active -->
        <app-action-selector
          #selector
          [actions]="actions"
          [(type)]="type"
          [(coworkerId)]="coworkerId"
          [coworkers]="data.coworkers()"
        />

        <div>
          <p class="mb-2 text-sm font-medium">{{ 'actions.scan' | transloco }}</p>
          <app-barcode-input (scanned)="run($event)" (cameraActive)="onCameraActive($event)" />
        </div>
      </section>

      <section class="card">
        <h2 class="mb-3 text-lg font-semibold">{{ 'actions.lastResult' | transloco }}</h2>
        @if (feedback(); as f) {
          @if (f.ok) {
            <div class="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              <p class="font-semibold">✔ {{ 'actions.success' | transloco }}</p>
              <p class="mt-1">
                {{ f.item }} <span class="font-mono text-xs">{{ f.barcode }}</span>
              </p>
              @if (f.coworker) {
                <p>{{ f.coworker }}</p>
              }
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

  selector = viewChild.required(ActionSelector);

  actions: ActionDef[] = [
    { type: 'checkout', key: 'actions.checkout', icon: '⬆️' },
    { type: 'checkin', key: 'actions.checkin', icon: '⬇️' },
    { type: 'laundry-in', key: 'actions.laundryIn', icon: '🧺' },
    { type: 'laundry-out', key: 'actions.laundryOut', icon: '✅' },
  ];

  onCameraActive(active: boolean) {
    this.selector().onCameraChanged(active);
  }

  run(barcode: string) {
    const res = this.data.perform(this.type(), barcode, this.coworkerId() || undefined);
    this.feedback.set(
      res.ok
        ? {
            ok: true,
            item: res.material.name,
            barcode: res.material.barcode,
            coworker: res.coworker?.name,
          }
        : { ok: false, error: res.error },
    );
  }
}
