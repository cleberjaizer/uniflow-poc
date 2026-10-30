export type ItemStatus = 'available' | 'checked-out' | 'in-laundry';
export type ActionType = 'registry' | 'checkout' | 'checkin' | 'laundry-in' | 'laundry-out';

export interface Coworker {
  id: string;
  name: string;
  barcode: string;
  registeredAt: string; // ISO
}

export interface Material {
  id: string;
  name: string;
  category: string;
  barcode: string;
  registeredAt: string; // ISO
  status: ItemStatus;
  holderId?: string;
}

export interface HistoryEntry {
  id: string;
  at: string; // ISO
  type: ActionType;
  materialId: string;
  coworkerId?: string;
}

export type ActionError = 'notFound' | 'invalidState' | 'coworkerRequired';
export type ActionResult =
  | { ok: true; material: Material; coworker?: Coworker }
  | { ok: false; error: ActionError };
