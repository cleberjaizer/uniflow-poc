import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ActionType, ItemStatus, MaterialType } from '../../core/models';
import { DataService } from '../../core/data.service';
import { LangService } from '../../core/lang.service';
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
  templateUrl: './dashboard.html',
})
export class Dashboard {
  data = inject(DataService);
  lang = inject(LangService);
  private transloco = inject(TranslocoService);
  private activeLang = toSignal(this.transloco.langChanges$);

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
    this.activeLang();
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
      })
      .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
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
