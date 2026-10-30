import { Injectable, computed, signal } from '@angular/core';
import { ActionResult, ActionType, Coworker, HistoryEntry, Material } from './models';

const KEY = 'uniflow.data.v1';

interface Store {
  coworkers: Coworker[];
  materials: Material[];
  history: HistoryEntry[];
}

const daysAgo = (d: number, h = 9) => {
  const t = new Date();
  t.setDate(t.getDate() - d);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

function seed(): Store {
  const names = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Alves', 'Elisa Ramos', 'Felipe Costa'];
  const coworkers: Coworker[] = names.map((name, i) => ({
    id: `c${i + 1}`,
    name,
    barcode: `EMP-${String(i + 1).padStart(4, '0')}`,
    registeredAt: daysAgo(30 - i),
  }));
  const items: [string, string][] = [
    ['Lab coat', 'Uniform'],
    ['Lab coat', 'Uniform'],
    ['Safety vest', 'Uniform'],
    ['Bath towel', 'Linen'],
    ['Bath towel', 'Linen'],
    ['Hand towel', 'Linen'],
    ['Work apron', 'Uniform'],
    ['Cleaning cloth', 'Linen'],
  ];
  const materials: Material[] = items.map(([name, category], i) => ({
    id: `m${i + 1}`,
    name,
    category,
    barcode: `MAT-${String(i + 1).padStart(4, '0')}`,
    registeredAt: daysAgo(20 - i),
    status: 'available',
  }));
  const history: HistoryEntry[] = [];
  let n = 1;
  const add = (type: ActionType, materialId: string, at: string, coworkerId?: string) =>
    history.push({ id: `h${n++}`, at, type, materialId, coworkerId });
  materials.forEach((m) => add('registry', m.id, m.registeredAt));

  const set = (id: string, status: Material['status'], holderId?: string) => {
    const m = materials.find((x) => x.id === id)!;
    m.status = status;
    m.holderId = holderId;
  };
  add('checkout', 'm1', daysAgo(6), 'c1'); add('checkin', 'm1', daysAgo(5), 'c1'); add('laundry-in', 'm1', daysAgo(5, 15)); add('laundry-out', 'm1', daysAgo(3));
  add('checkout', 'm3', daysAgo(4), 'c2'); set('m3', 'checked-out', 'c2');
  add('checkout', 'm4', daysAgo(3), 'c3'); add('checkin', 'm4', daysAgo(2), 'c3'); add('laundry-in', 'm4', daysAgo(2, 14)); set('m4', 'in-laundry');
  add('checkout', 'm7', daysAgo(1), 'c5'); set('m7', 'checked-out', 'c5');
  history.sort((a, b) => a.at.localeCompare(b.at));
  return { coworkers, materials, history };
}

/** All data lives in the browser (localStorage). No backend in this first version. */
@Injectable({ providedIn: 'root' })
export class DataService {
  private store = signal<Store>(this.load());

  readonly coworkers = computed(() => this.store().coworkers);
  readonly materials = computed(() => this.store().materials);
  readonly history = computed(() => [...this.store().history].sort((a, b) => b.at.localeCompare(a.at)));

  readonly counts = computed(() => {
    const m = this.materials();
    return {
      total: m.length,
      available: m.filter((x) => x.status === 'available').length,
      checkedOut: m.filter((x) => x.status === 'checked-out').length,
      inLaundry: m.filter((x) => x.status === 'in-laundry').length,
    };
  });

  coworkerById(id?: string) {
    return this.coworkers().find((c) => c.id === id);
  }
  materialById(id?: string) {
    return this.materials().find((m) => m.id === id);
  }
  findMaterial(barcode: string) {
    const b = barcode.trim().toLowerCase();
    return this.materials().find((m) => m.barcode.toLowerCase() === b);
  }
  findCoworker(barcode: string) {
    const b = barcode.trim().toLowerCase();
    return this.coworkers().find((c) => c.barcode.toLowerCase() === b);
  }

  /** Label rules are TBD: this is the single place to change how barcodes are generated. */
  private nextBarcode(prefix: string, existing: string[]) {
    let n = existing.length + 1;
    let code = '';
    do {
      code = `${prefix}-${String(n++).padStart(4, '0')}`;
    } while (existing.includes(code));
    return code;
  }

  registerMaterial(name: string, category: string): Material {
    const s = this.store();
    const material: Material = {
      id: `m${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      barcode: this.nextBarcode('MAT', s.materials.map((m) => m.barcode)),
      registeredAt: new Date().toISOString(),
      status: 'available',
    };
    const entry: HistoryEntry = { id: `h${Date.now()}`, at: material.registeredAt, type: 'registry', materialId: material.id };
    this.commit({ ...s, materials: [...s.materials, material], history: [...s.history, entry] });
    return material;
  }

  registerCoworker(name: string): Coworker {
    const s = this.store();
    const coworker: Coworker = {
      id: `c${Date.now()}`,
      name: name.trim(),
      barcode: this.nextBarcode('EMP', s.coworkers.map((c) => c.barcode)),
      registeredAt: new Date().toISOString(),
    };
    this.commit({ ...s, coworkers: [...s.coworkers, coworker] });
    return coworker;
  }

  perform(type: Exclude<ActionType, 'registry'>, materialBarcode: string, coworkerId?: string): ActionResult {
    const s = this.store();
    const found = this.findMaterial(materialBarcode);
    if (!found) return { ok: false, error: 'notFound' };

    let next: Material;
    let coworker: Coworker | undefined;
    switch (type) {
      case 'checkout':
        if (found.status !== 'available') return { ok: false, error: 'invalidState' };
        coworker = this.coworkerById(coworkerId);
        if (!coworker) return { ok: false, error: 'coworkerRequired' };
        next = { ...found, status: 'checked-out', holderId: coworker.id };
        break;
      case 'checkin':
        if (found.status !== 'checked-out') return { ok: false, error: 'invalidState' };
        coworker = this.coworkerById(found.holderId);
        next = { ...found, status: 'available', holderId: undefined };
        break;
      case 'laundry-in':
        if (found.status !== 'available') return { ok: false, error: 'invalidState' };
        next = { ...found, status: 'in-laundry', holderId: undefined };
        break;
      case 'laundry-out':
        if (found.status !== 'in-laundry') return { ok: false, error: 'invalidState' };
        next = { ...found, status: 'available', holderId: undefined };
        break;
    }
    const entry: HistoryEntry = {
      id: `h${Date.now()}`,
      at: new Date().toISOString(),
      type,
      materialId: found.id,
      coworkerId: coworker?.id,
    };
    this.commit({
      ...s,
      materials: s.materials.map((m) => (m.id === next.id ? next : m)),
      history: [...s.history, entry],
    });
    return { ok: true, material: next, coworker };
  }

  resetDemo() {
    this.commit(seed());
  }

  private commit(next: Store) {
    this.store.set(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  private load(): Store {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as Store;
    } catch {}
    return seed();
  }
}
