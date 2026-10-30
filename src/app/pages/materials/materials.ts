import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { DataService } from '../../core/data.service';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-materials',
  imports: [DatePipe, FormsModule, TranslocoPipe, StatusBadge],
  template: `
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ 'materials.title' | transloco }}</h1>
      <button class="btn btn-primary" (click)="adding.set(!adding())">+ {{ 'materials.add' | transloco }}</button>
    </div>

    @if (adding()) {
      <form class="card mb-4 grid gap-3 sm:grid-cols-3" (ngSubmit)="save()">
        <input class="input" name="name" [placeholder]="'materials.name' | transloco" [(ngModel)]="name" required />
        <input class="input" name="cat" [placeholder]="'materials.category' | transloco" [(ngModel)]="category" />
        <button class="btn btn-primary" type="submit" [disabled]="!name.trim()">{{ 'materials.save' | transloco }}</button>
      </form>
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
  name = '';
  category = '';

  rows = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.data
      .materials()
      .map((m) => ({ ...m, holder: this.data.coworkerById(m.holderId)?.name ?? '' }))
      .filter((m) => !q || `${m.name} ${m.category} ${m.barcode} ${m.holder}`.toLowerCase().includes(q));
  });

  save() {
    if (!this.name.trim()) return;
    this.data.registerMaterial(this.name, this.category);
    this.name = this.category = '';
    this.adding.set(false);
  }
}
