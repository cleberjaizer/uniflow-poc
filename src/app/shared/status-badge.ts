import { Component, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ItemStatus } from '../core/models';

@Component({
  selector: 'app-status-badge',
  imports: [TranslocoPipe],
  template: `<span class="badge" [class]="cls()">{{ key() | transloco }}</span>`,
})
export class StatusBadge {
  status = input.required<ItemStatus>();
  cls() {
    return {
      available: 'bg-emerald-100 text-emerald-700',
      'checked-out': 'bg-amber-100 text-amber-700',
      'in-laundry': 'bg-sky-100 text-sky-700',
    }[this.status()];
  }
  key() {
    return { available: 'status.available', 'checked-out': 'status.checkedOut', 'in-laundry': 'status.inLaundry' }[this.status()];
  }
}
