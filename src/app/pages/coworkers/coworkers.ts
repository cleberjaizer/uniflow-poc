import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { LangService } from '../../core/lang.service';

@Component({
  selector: 'app-coworkers',
  imports: [DatePipe, FormsModule, TranslocoPipe],
  templateUrl: './coworkers.html',
})
export class Coworkers {
  auth = inject(AuthService);
  lang = inject(LangService);
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
