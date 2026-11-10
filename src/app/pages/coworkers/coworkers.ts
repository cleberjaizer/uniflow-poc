import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';

@Component({
  selector: 'app-coworkers',
  imports: [DatePipe, FormsModule, TranslocoPipe],
  template: `
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">{{ 'coworkers.title' | transloco }}</h1>
      @if (auth.isAdmin()) {
        <button class="btn btn-primary" (click)="adding.set(!adding())">
          + {{ 'coworkers.add' | transloco }}
        </button>
      }
    </div>

    @if (auth.isAdmin() && adding()) {
      <form class="card mb-4 flex gap-3" (ngSubmit)="save()">
        <input
          class="input"
          name="name"
          [placeholder]="'coworkers.name' | transloco"
          [ngModel]="name()"
          (ngModelChange)="name.set($event)"
          required
        />
        <button class="btn btn-primary" type="submit" [disabled]="!name().trim()">
          {{ 'common.save' | transloco }}
        </button>
      </form>
    }

    <div class="card">
      <div
        class="hidden grid-cols-12 gap-2 border-b border-slate-200 pb-2 text-xs font-medium uppercase text-slate-500 md:grid"
      >
        <span class="col-span-4">{{ 'coworkers.name' | transloco }}</span>
        <span class="col-span-3">{{ 'common.barcode' | transloco }}</span>
        <span class="col-span-3">{{ 'common.registered' | transloco }}</span>
        <span class="col-span-2">{{ 'coworkers.itemsHeld' | transloco }}</span>
      </div>
      @for (c of rows(); track c.id) {
        <div
          class="grid grid-cols-1 gap-1 border-b border-slate-100 py-2 text-sm md:grid-cols-12 md:gap-2"
        >
          <span class="font-medium md:col-span-4">{{ c.name }}</span>
          <span class="font-mono text-xs md:col-span-3">{{ c.barcode }}</span>
          <span class="text-slate-500 md:col-span-3">{{
            c.registeredAt | date: 'mediumDate'
          }}</span>
          <span class="md:col-span-2">{{ c.held }}</span>
        </div>
      }
    </div>
  `,
})
export class Coworkers {
  auth = inject(AuthService);
  private data = inject(DataService);
  adding = signal(false);
  name = signal('');

  rows = computed(() =>
    this.data.coworkers().map((c) => ({
      ...c,
      held: this.data.materials().filter((m) => m.holderId === c.id).length,
    })),
  );

  save() {
    if (!this.auth.isAdmin()) return;
    const val = this.name().trim();
    if (!val) return;
    this.data.registerCoworker(val);
    this.name.set('');
    this.adding.set(false);
  }
}
