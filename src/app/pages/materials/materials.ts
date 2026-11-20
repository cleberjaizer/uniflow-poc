import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/data.service';
import { LangService } from '../../core/lang.service';
import { MaterialType } from '../../core/models';
import { BarcodeInput } from '../../shared/barcode-input';
import { StatusBadge } from '../../shared/status-badge';

@Component({
  selector: 'app-materials',
  imports: [DatePipe, FormsModule, TranslocoPipe, StatusBadge, BarcodeInput],
  templateUrl: './materials.html',
})
export class Materials {
  auth = inject(AuthService);
  lang = inject(LangService);
  private data = inject(DataService);
  private transloco = inject(TranslocoService);
  private activeLang = toSignal(this.transloco.langChanges$);
  scanner = viewChild(BarcodeInput);
  adding = signal(false);
  /** Type/name section; auto-collapses while the camera is on. */
  detailsOpen = signal(true);
  cameraOn = signal(false);
  types = Object.values(MaterialType);
  search = signal('');
  type = signal<MaterialType | ''>('');
  name = signal('');
  barcode = signal('');
  saved = signal('');

  duplicate = computed(() => !!this.barcode() && this.data.barcodeInUse(this.barcode()));
  // Type and barcode are required; the name is just an optional detail.
  canSave = computed(
    () => this.auth.isAdmin() && !!this.type() && !!this.barcode() && !this.duplicate(),
  );

  rows = computed(() => {
    this.activeLang(); // re-run the search when the language changes
    const q = this.search().trim().toLowerCase();
    return this.data
      .materials()
      .map((m) => ({ ...m, holder: this.data.coworkerById(m.holderId)?.name ?? '' }))
      .filter((m) => {
        const label = this.transloco.translate(`materialType.${m.type}`);
        return !q || `${label} ${m.name} ${m.barcode} ${m.holder}`.toLowerCase().includes(q);
      })
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  });

  toggle() {
    this.adding.update((v) => !v);
    this.resetForm();
  }

  resetForm() {
    this.scanner()?.stop();
    this.cameraOn.set(false);
    this.detailsOpen.set(true);
    this.type.set('');
    this.name.set('');
    this.barcode.set('');
    this.saved.set('');
  }

  onCameraActive(active: boolean) {
    this.cameraOn.set(active);
    this.detailsOpen.set(!active);
  }

  setBarcode(code: string) {
    if (this.saved()) return;
    this.barcode.set(code.trim());
    // Stop the camera only when the barcode is usable; on a duplicate keep scanning.
    if (this.barcode() && !this.duplicate()) this.scanner()?.stop();
  }

  save() {
    const type = this.type();
    if (!this.canSave() || !type) return;
    const res = this.data.registerMaterial(type, this.name(), this.barcode());
    if (!res.ok) return; // duplicate/empty are already blocked by canSave()
    this.scanner()?.stop();
    this.saved.set(
      `${this.transloco.translate(`materialType.${res.material.type}`)} (${res.material.barcode})`,
    );
    this.barcode.set('');
  }
}
