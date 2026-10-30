import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { DataService } from '../../core/data.service';
import { BarcodeInput } from '../../shared/barcode-input';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-materials',
  imports: [DatePipe, FormsModule, TranslocoPipe, StatusBadge, BarcodeInput],
  template: `
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ 'materials.title' | transloco }}</h1>
      <button class="btn btn-primary" (click)="toggle()">
        {{ adding() ? ('materials.cancel' | transloco) : '+ ' + ('materials.add' | transloco) }}
      </button>
    </div>

    @if (adding()) {
      <section class="card mb-4 space-y-4">
        <h2 class="text-lg font-semibold">{{ 'materials.addTitle' | transloco }}</h2>

        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-sm font-medium">
            {{ 'materials.name' | transloco }}
            <input class="input mt-1" name="name" autocomplete="off" [ngModel]="name()" (ngModelChange)="name.set($event)" />
          </label>
          <label class="block text-sm font-medium">
            {{ 'materials.category' | transloco }}
            <input class="input mt-1" name="cat" autocomplete="off" [ngModel]="category()" (ngModelChange)="category.set($event)" />
          </label>
        </div>

        <div>
          <p class="mb-2 text-sm font-medium">{{ 'materials.scanBarcode' | transloco }}</p>
          <app-barcode-input [autoStop]="true" submitKey="materials.useCode" (scanned)="setBarcode($event)" />
        </div>

        <div class="rounded-lg bg-slate-50 p-3 text-sm">
          <span class="text-slate-500">{{ 'materials.barcode' | transloco }}:</span>
          @if (barcode()) {
            <span class="ml-1 font-mono font-semibold">{{ barcode() }}</span>
            @if (duplicate()) {
              <p class="mt-1 text-red-600">{{ 'materials.error.barcodeDuplicate' | transloco }}</p>
            }
          } @else {
            <span class="ml-1 text-slate-400">{{ 'materials.noBarcode' | transloco }}</span>
          }
        </div>

        @if (saved(); as s) {
          <p class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            ✔ {{ 'materials.saved' | transloco }}: {{ s }}
          </p>
        }

        <div class="flex justify-end">
          <button class="btn btn-primary" type="button" [disabled]="!canSave()" (click)="save()">
            {{ 'materials.save' | transloco }}
          </button>
        </div>
      </section>
    }

    <input class="input mb-3" [placeholder]="'dashboard.search' | transloco" [ngModel]="search()" (ngModelChange)="search.set($event)" />

    <div class="card">
      <div class="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-medium uppercase text-slate-500 md:grid">
        <span class="col-span-3">{{ 'materials.name' | transloco }}</span>
        <span class="col-span-2">{{ 'materials.barcode' | transloco }}</span>
        <span class="col-span-2">{{ 'materials.registered' | transloco }}</span>
        <span class="col-span-2">{{ 'materials.status' | transloco }}</span>
        <span class="col-span-3">{{ 'materials.holder' | transloco }}</span>
      </div>
      @for (m of rows(); track m.id) {
        <div class="grid grid-cols-1 gap-1 border-b border-slate-100 py-2 text-sm md:grid-cols-12 md:items-center md:gap-2">
          <span class="font-medium md:col-span-3">{{ m.name }} <span class="text-xs text-slate-400">{{ m.category }}</span></span>
          <span class="font-mono text-xs md:col-span-2">{{ m.barcode }}</span>
          <span class="text-slate-500 md:col-span-2">{{ m.registeredAt | date: 'mediumDate' }}</span>
          <span class="md:col-span-2"><app-status-badge [status]="m.status" /></span>
          <span class="text-slate-600 md:col-span-3">{{ m.holder }}</span>
        </div>
      } @empty {
        <p class="py-6 text-center text-sm text-slate-400">{{ 'materials.empty' | transloco }}</p>
      }
    </div>
  `,
})
export class Materials {
  private data = inject(DataService);
  adding = signal(false);
  search = signal('');
  name = signal('');
  category = signal('');
  barcode = signal('');
  saved = signal('');

  duplicate = computed(() => !!this.barcode() && this.data.barcodeInUse(this.barcode()));
  canSave = computed(() => !!this.name().trim() && !!this.barcode() && !this.duplicate());

  rows = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.data
      .materials()
      .map((m) => ({ ...m, holder: this.data.coworkerById(m.holderId)?.name ?? '' }))
      .filter((m) => !q || `${m.name} ${m.category} ${m.barcode} ${m.holder}`.toLowerCase().includes(q));
  });

  toggle() {
    this.adding.update((v) => !v);
    this.saved.set('');
  }

  setBarcode(code: string) {
    this.barcode.set(code.trim());
    this.saved.set('');
  }

  save() {
    if (!this.canSave()) return;
    const res = this.data.registerMaterial(this.name(), this.category(), this.barcode());
    if (!res.ok) return; // duplicate/empty are already blocked by canSave()
    this.saved.set(`${res.material.name} (${res.material.barcode})`);
    // Keep the form open and clear it so the next item can be registered right away.
    this.name.set('');
    this.category.set('');
    this.barcode.set('');
  }
}
