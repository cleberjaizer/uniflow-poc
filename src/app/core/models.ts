import usersMock from '../mocks/users.json';

export type ItemStatus = 'available' | 'checked-out' | 'in-laundry';
export type ActionType = 'registry' | 'checkout' | 'checkin' | 'laundry-in' | 'laundry-out';

export enum MaterialType {
  LAB_COAT = 'LAB_COAT',
  SAFETY_VEST = 'SAFETY_VEST',
  WORK_APRON = 'WORK_APRON',
  COLD_JACKET = 'COLD_JACKET',
  HARD_HAT = 'HARD_HAT',
  SAFETY_GLASSES = 'SAFETY_GLASSES',
  STEEL_TOE_BOOTS = 'STEEL_TOE_BOOTS',
  BATH_TOWEL = 'BATH_TOWEL',
  HAND_TOWEL = 'HAND_TOWEL',
  CLEANING_CLOTH = 'CLEANING_CLOTH',
}

export interface Coworker {
  id: string;
  name: string;
  barcode: string;
  registeredAt: string; // ISO
}

export interface Material {
  id: string;
  /** Main classification of the item (what it is). */
  type: MaterialType;
  /** Free-form detail, optional. */
  name: string;
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

export type ActionError = 'notRegisteredCode' | 'invalidState' | 'coworkerRequired';
export type ActionResult =
  { ok: true; material: Material; coworker?: Coworker } | { ok: false; error: ActionError };

export type RegisterResult =
  { ok: true; material: Material } | { ok: false; error: 'barcodeRequired' | 'barcodeDuplicate' };

export type UserRole = 'admin' | 'user';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
}

/** Allowed users are read from the mock file `src/app/mocks/users.json`. */
export const ALLOWED_USERS: AuthUser[] = usersMock as AuthUser[];
