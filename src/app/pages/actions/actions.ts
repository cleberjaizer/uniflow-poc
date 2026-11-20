import { Component, computed, inject, signal, viewChild } from '@angular/core';
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
  detail?: string;
  barcode?: string;
  coworker?: string;
}

@Component({
  selector: 'app-actions',
  imports: [TranslocoPipe, BarcodeInput, ActionSelector],
  templateUrl: './actions.html',
})
export class Actions {
  data = inject(DataService);
  type = signal<FlowAction>('checkout');
  coworkerId = signal('');
  feedback = signal<Feedback | null>(null);
  canScan = computed(() => this.type() !== 'checkout' || !!this.coworkerId());

  selector = viewChild.required(ActionSelector);
  scanner = viewChild.required(BarcodeInput);

  actions: ActionDef[] = [
    { type: 'checkout', key: 'actions.checkout', icon: '⬆️' },
    { type: 'checkin', key: 'actions.checkin', icon: '⬇️' },
    { type: 'laundry-in', key: 'actions.laundryIn', icon: '🧺' },
    { type: 'laundry-out', key: 'actions.laundryOut', icon: '✅' },
  ];

  resetForm() {
    this.coworkerId.set('');
    this.feedback.set(null);
    this.scanner().reset();
  }

  onCameraActive(active: boolean) {
    if (active) {
      this.feedback.set(null);
    }
    this.selector().onCameraChanged(active);
  }

  run(barcode: string) {
    const res = this.data.perform(this.type(), barcode, this.coworkerId() || undefined);
    this.feedback.set(
      res.ok
        ? {
            ok: true,
            item: res.material.type,
            detail: res.material.name,
            barcode: res.material.barcode,
            coworker: res.coworker?.name,
          }
        : { ok: false, error: res.error },
    );
    this.scanner().stop();
  }
}
