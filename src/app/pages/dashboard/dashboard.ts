import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionType } from '../../core/models';
import { DataService } from '../../core/data.service';

const KEYS: Record<ActionType, string> = {
  registry: 'history.registry',
  checkout: 'history.checkout',
  checkin: 'history.checkin',
  'laundry-in': 'history.laundryIn',
  'laundry-out': 'history.laundryOut',
};

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, FormsModule, TranslocoPipe],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'dashboard.title' | transloco }}</h1>

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div class="card"><p class="text-xs text-slate-500">{{ 'dashboard.total' | transloco }}</p><p class="text-3xl font-bold">{{ data.counts().total }}</p></div>
      <div class="card"><p class="text-xs text-slate-500">{{ 'status.available' | transloco }}</p><p class="text-3xl font-bold text-emerald-600">{{ data.counts().available }}</p></div>
      <div class="card"><p class="text-xs text-slate-500">{{ 'status.checkedOut' | transloco }}</p><p class="text-3xl font-bold text-amber-600">{{ data.counts().checkedOut }}</p></div>
      <div class="card"><p class="text-xs text-slate-500">{{ 'status.inLaundry' | transloco }}</p><p class="text-3xl font-bold text-sky-600">{{ data.counts().inLaundry }}</p></div>
    </section>

    <section class="card mt-6">
      <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 class="text-lg font-semibold">{{ 'dashboard.history' | transloco }}</h2>
        <div class="flex gap-2">
          <input class="input" [placeholder]="'dashboard.search' | transloco" [ngModel]="search()" (ngModelChange)="search.set($event)" />
          <select class="input !w-auto" [ngModel]="filter()" (ngModelChange)="filter.set($event)">
            <option value="all">{{ 'dashboard.filterAll' | transloco }}</option>
            @for (t of types; track t) {
              <option [value]="t">{{ keys[t] | transloco }}</option>
            }
          </select>
        </div>
      </div>

      <div class="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-medium uppercase text-slate-500 md:grid">
        <span class="col-span-3">{{ 'dashboard.col.date' | transloco }}</span>
        <span class="col-span-2">{{ 'dashboard.col.action' | transloco }}</span>
        <span class="col-span-4">{{ 'dashboard.col.item' | transloco }}</span>
        <span class="col-span-3">{{ 'dashboard.col.coworker' | transloco }}</span>
      </div>

      @for (r of rows(); track r.id) {
        <div class="grid grid-cols-1 gap-1 border-b border-slate-100 py-2 text-sm md:grid-cols-12 md:gap-2">
          <span class="text-slate-500 md:col-span-3">{{ r.at | date: 'short' }}</span>
          <span class="font-medium md:col-span-2">{{ keys[r.type] | transloco }}</span>
          <span class="md:col-span-4">{{ r.item }} <span class="text-xs text-slate-400">{{ r.barcode }}</span></span>
          <span class="text-slate-600 md:col-span-3">{{ r.coworker }}</span>
        </div>
      } @empty {
        <p class="py-6 text-center text-sm text-slate-400">{{ 'dashboard.empty' | transloco }}</p>
      }

      <div class="mt-4 text-right">
        <button class="btn btn-secondary" (click)="data.resetDemo()">{{ 'common.resetDemo' | transloco }}</button>
      </div>
    </section>
  `,
})
export class Dashboard {
  data = inject(DataService);
  keys = KEYS;
  types: ActionType[] = ['registry', 'checkout', 'checkin', 'laundry-in', 'laundry-out'];
  search = signal('');
  filter = signal<'all' | ActionType>('all');

  rows = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.data
      .history()
      .map((h) => {
        const m = this.data.materialById(h.materialId);
        return {
          id: h.id,
          at: h.at,
          type: h.type,
          item: m?.name ?? '?',
          barcode: m?.barcode ?? '',
          coworker: this.data.coworkerById(h.coworkerId)?.name ?? '',
        };
      })
      .filter((r) => (this.filter() === 'all' || r.type === this.filter()))
      .filter((r) => !q || `${r.item} ${r.barcode} ${r.coworker}`.toLowerCase().includes(q));
  });
}
