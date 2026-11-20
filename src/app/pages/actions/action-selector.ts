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
  templateUrl: './action-selector.html',
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
  /** Emits whenever the user clicks an action button. */
  actionSelected = output<FlowAction>();
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
    this.actionSelected.emit(t);
  }
}
