import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ActionType, ItemStatus, MaterialType } from '../../core/models';
import { DataService } from '../../core/data.service';
import { StatusBadge } from '../../shared/status-badge';

const KEYS: Record<ActionType, string> = {
  registry: 'history.registry',
  checkout: 'history.checkout',
  checkin: 'history.checkin',
  'laundry-in': 'history.laundryIn',
  'laundry-out': 'history.laundryOut',
};

type CardFilter = 'all' | ItemStatus;

const CARD_TITLES: Record<CardFilter, string> = {
  all: 'dashboard.total',
  available: 'status.available',
  'checked-out': 'status.checkedOut',
  'in-laundry': 'status.inLaundry',
};

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, FormsModule, TranslocoPipe, StatusBadge],
  template: `
    <h1 class="mb-4 text-2xl font-bold">{{ 'dashboard.title' | transloco }}</h1>

    <section class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <button
        type="button"
        class="card cursor-pointer text-left transition hover:bg-slate-50"
        [class.ring-2]="selectedCard() === 'all'"
        [class.ring-brand-600]="selectedCard() === 'all'"
        [class.bg-brand-50]="selectedCard() === 'all'"
        (click)="selectCard('all')"
      >
        <p class="text-xs text-slate-500">{{ 'dashboard.total' | transloco }}</p>
        <p class="text-3xl font-bold">{{ data.counts().total }}</p>
      </button>
      <button
        type="button"
        class="card cursor-pointer text-left transition hover:bg-slate-50"
        [class.ring-2]="selectedCard() === 'available'"
        [class.ring-brand-600]="selectedCard() === 'available'"
        [class.bg-brand-50]="selectedCard() === 'available'"
        (click)="selectCard('available')"
      >
        <p class="text-xs text-slate-500">{{ 'status.available' | transloco }}</p>
        <p class="text-3xl font-bold text-emerald-600">{{ data.counts().available }}</p>
      </button>
      <button
        type="button"
        class="card cursor-pointer text-left transition hover:bg-slate-50"
        [class.ring-2]="selectedCard() === 'checked-out'"
        [class.ring-brand-600]="selectedCard() === 'checked-out'"
        [class.bg-brand-50]="selectedCard() === 'checked-out'"
        (click)="selectCard('checked-out')"
      >
        <p class="text-xs text-slate-500">{{ 'status.checkedOut' | transloco }}</p>
        <p class="text-3xl font-bold text-amber-600">{{ data.counts().checkedOut }}</p>
      </button>
      <button
        type="button"
        class="card cursor-pointer text-left transition hover:bg-slate-50"
        [class.ring-2]="selectedCard() === 'in-laundry'"
        [class.ring-brand-600]="selectedCard() === 'in-laundry'"
        [class.bg-brand-50]="selectedCard() === 'in-laundry'"
        (click)="selectCard('in-laundry')"
      >
        <p class="text-xs text-slate-500">{{ 'status.inLaundry' | transloco }}</p>
        <p class="text-3xl font-bold text-sky-600">{{ data.counts().inLaundry }}</p>
      </button>
    </section>

    @if (selectedCard(); as card) {
      <section class="card mt-6">
        <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold">{{ cardTitles[card] | transloco }}</h2>
          <div class="flex flex-wrap gap-2 sm:flex-nowrap">
            <input
              class="input"
              [placeholder]="'dashboard.search' | transloco"
              [ngModel]="materialSearch()"
              (ngModelChange)="materialSearch.set($event)"
            />
            <select
              class="input !w-auto"
              [ngModel]="typeFilter()"
              (ngModelChange)="typeFilter.set($event)"
            >
              <option value="all">{{ 'dashboard.filterAllTypes' | transloco }}</option>
              @for (t of materialTypes; track t) {
                <option [value]="t">{{ 'materialType.' + t | transloco }}</option>
              }
            </select>
            <button
              type="button"
              class="btn btn-primary whitespace-nowrap"
              (click)="showHistory()"
            >
              {{ 'dashboard.showHistory' | transloco }}
            </button>
          </div>
        </div>

        <div
          class="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-medium uppercase text-slate-500 md:grid"
        >
          <span class="col-span-3">{{ 'materials.type' | transloco }}</span>
          <span class="col-span-2">{{ 'materials.barcode' | transloco }}</span>
          <span class="col-span-2">{{ 'materials.registered' | transloco }}</span>
          <span class="col-span-2">{{ 'materials.status' | transloco }}</span>
          <span class="col-span-3">{{ 'materials.holder' | transloco }}</span>
        </div>

        @for (m of materialRows(); track m.id) {
          <div
            class="grid grid-cols-1 gap-1 border-b border-slate-100 py-2 text-sm md:grid-cols-12 md:items-center md:gap-2"
          >
            <span class="font-medium md:col-span-3"
              >{{ 'materialType.' + m.type | transloco }}
              @if (m.name) {
                <span class="text-xs text-slate-400">{{ m.name }}</span>
              }
            </span>
            <span class="font-mono text-xs md:col-span-2">{{ m.barcode }}</span>
            <span class="text-slate-500 md:col-span-2">{{
              m.registeredAt | date: 'mediumDate'
            }}</span>
            <span class="md:col-span-2"><app-status-badge [status]="m.status" /></span>
            <span class="text-slate-600 md:col-span-3">{{ m.holder }}</span>
          </div>
        } @empty {
          <p class="py-6 text-center text-sm text-slate-400">{{ 'materials.empty' | transloco }}</p>
        }
      </section>
    } @else {
      <section class="card mt-6">
        <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold">{{ 'dashboard.history' | transloco }}</h2>
          <div class="flex gap-2">
            <input
              class="input"
              [placeholder]="'dashboard.search' | transloco"
              [ngModel]="search()"
              (ngModelChange)="search.set($event)"
            />
            <select class="input !w-auto" [ngModel]="filter()" (ngModelChange)="filter.set($event)">
              <option value="all">{{ 'dashboard.filterAll' | transloco }}</option>
              @for (t of types; track t) {
                <option [value]="t">{{ keys[t] | transloco }}</option>
              }
            </select>
          </div>
        </div>

        <div
          class="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-medium uppercase text-slate-500 md:grid"
        >
          <span class="col-span-3">{{ 'dashboard.col.date' | transloco }}</span>
          <span class="col-span-2">{{ 'dashboard.col.action' | transloco }}</span>
          <span class="col-span-4">{{ 'dashboard.col.item' | transloco }}</span>
          <span class="col-span-3">{{ 'dashboard.col.coworker' | transloco }}</span>
        </div>

        @for (r of rows(); track r.id) {
          <div
            class="grid grid-cols-1 gap-1 border-b border-slate-100 py-2 text-sm md:grid-cols-12 md:gap-2"
          >
            <span class="text-slate-500 md:col-span-3">{{ r.at | date: 'short' }}</span>
            <span class="font-medium md:col-span-2">{{ keys[r.type] | transloco }}</span>
            <span class="md:col-span-4"
              >{{ r.item ? ('materialType.' + r.item | transloco) : '?' }}
              <span class="text-xs text-slate-400">{{ r.barcode }}</span></span
            >
            <span class="text-slate-600 md:col-span-3">{{ r.coworker }}</span>
          </div>
        } @empty {
          <p class="py-6 text-center text-sm text-slate-400">{{ 'dashboard.empty' | transloco }}</p>
        }
      </section>
    }
  `,
})
export class Dashboard {
  data = inject(DataService);
  private transloco = inject(TranslocoService);
  private lang = toSignal(this.transloco.langChanges$);

  keys = KEYS;
  cardTitles = CARD_TITLES;
  types: ActionType[] = ['registry', 'checkout', 'checkin', 'laundry-in', 'laundry-out'];
  materialTypes = Object.values(MaterialType);

  search = signal('');
  filter = signal<'all' | ActionType>('all');

  selectedCard = signal<CardFilter | null>(null);
  materialSearch = signal('');
  typeFilter = signal<'all' | MaterialType>('all');

  selectCard(card: CardFilter) {
    this.selectedCard.set(card);
  }

  showHistory() {
    this.selectedCard.set(null);
    this.materialSearch.set('');
    this.typeFilter.set('all');
  }

  materialRows = computed(() => {
    this.lang();
    const card = this.selectedCard();
    const q = this.materialSearch().trim().toLowerCase();
    const tf = this.typeFilter();

    return this.data
      .materials()
      .filter((m) => !card || card === 'all' || m.status === card)
      .filter((m) => tf === 'all' || m.type === tf)
      .map((m) => ({ ...m, holder: this.data.coworkerById(m.holderId)?.name ?? '' }))
      .filter((m) => {
        const label = this.transloco.translate(`materialType.${m.type}`);
        return !q || `${label} ${m.name} ${m.barcode} ${m.holder}`.toLowerCase().includes(q);
      });
  });

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
          item: m?.type,
          barcode: m?.barcode ?? '',
          coworker: this.data.coworkerById(h.coworkerId)?.name ?? '',
        };
      })
      .filter((r) => this.filter() === 'all' || r.type === this.filter())
      .filter((r) => !q || `${r.item} ${r.barcode} ${r.coworker}`.toLowerCase().includes(q));
  });
}
