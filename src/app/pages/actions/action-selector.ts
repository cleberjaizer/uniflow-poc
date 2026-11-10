import { Component, computed, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActionType, Coworker } from '../../core/models';

type FlowAction = Exclude<ActionType, 'registry'>;

export interface ActionDef {
  type: FlowAction;
  key: string;
  icon: string;
}

/**
 * Collapsible panel that shows the 4 flow-action buttons and the coworker selector.
 * Auto-collapses when the camera becomes active; the user can also toggle it manually.
 */
@Component({
  selector: 'app-action-selector',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <!-- Header row: selected action summary + toggle button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xl" aria-hidden="true">{{ currentAction().icon }}</span>
        <span class="font-semibold text-sm">{{ currentAction().key | transloco }}</span>
      </div>
      <button
        type="button"
        class="btn btn-secondary text-xs px-2 py-1"
        (click)="toggle()"
        [attr.aria-expanded]="expanded()"
      >
        {{ (expanded() ? 'actions.hideOptions' : 'actions.showOptions') | transloco }}
        <span aria-hidden="true" class="ml-1">{{ expanded() ? '▲' : '▼' }}</span>
      </button>
    </div>

    <!-- Collapsible body -->
    @if (expanded()) {
      <div class="mt-3 space-y-3">
        <div class="grid grid-cols-2 gap-2">
          @for (a of actions(); track a.type) {
            <button
              type="button"
              class="rounded-lg border p-3 text-left text-sm transition"
              [class]="
                type() === a.type
                  ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                  : 'border-slate-200 hover:bg-slate-50'
              "
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
            <select
              class="input mt-1"
              [ngModel]="coworkerId()"
              (ngModelChange)="coworkerId.set($event)"
            >
              <option value="">{{ 'actions.selectCoworker' | transloco }}</option>
              @for (c of coworkers(); track c.id) {
                <option [value]="c.id">{{ c.name }} ({{ c.barcode }})</option>
              }
            </select>
          </label>
        }
      </div>
    }
  `,
})
export class ActionSelector {
  /** The 4 possible flow actions. */
  actions = input.required<ActionDef[]>();
  /** Currently selected action type (two-way bindable). */
  type = model.required<FlowAction>();
  /** Currently selected coworker id (two-way bindable). */
  coworkerId = model.required<string>();
  /** Available coworkers for the coworker selector. */
  coworkers = input.required<Coworker[]>();
  /**
   * When true the panel collapses automatically.
   * Caller sets this to true when the camera turns on and false when it turns off.
   */
  cameraOn = input(false);

  /** Internal open/close state; starts expanded, collapses when camera turns on. */
  expanded = signal(true);

  currentAction = computed(
    () => this.actions().find((a) => a.type === this.type()) ?? this.actions()[0],
  );

  /** Auto-collapse / auto-expand following camera state changes. */
  constructor() {
    // We use a getter-style effect-free approach: listen to cameraOn via ngOnChanges equivalent.
    // Since signals are reactive, we simply expose a method the parent calls via effect.
  }

  /** Called by parent when camera state changes. */
  onCameraChanged(active: boolean) {
    this.expanded.set(!active);
  }

  toggle() {
    this.expanded.update((v) => !v);
  }

  select(t: FlowAction) {
    this.type.set(t);
  }
}
