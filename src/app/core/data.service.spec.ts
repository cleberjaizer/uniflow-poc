import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [DataService],
    });
    service = TestBed.inject(DataService);
  });

  it('should initialize with seed data when localStorage is empty', () => {
    expect(service.coworkers().length).toBeGreaterThan(0);
    expect(service.materials().length).toBeGreaterThan(0);
    expect(service.history().length).toBeGreaterThan(0);
  });

  it('should calculate counts correctly', () => {
    const counts = service.counts();
    expect(counts.total).toBe(service.materials().length);
    expect(counts.available + counts.checkedOut + counts.inLaundry).toBe(counts.total);
  });

  it('should register a new material with unique barcode', () => {
    const res = service.registerMaterial('Safety Helmet', 'PPE', 'MAT-9999');
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.material.name).toBe('Safety Helmet');
      expect(res.material.barcode).toBe('MAT-9999');
      expect(res.material.status).toBe('available');
      expect(service.findMaterial('mat-9999')).toBeDefined();
    }
  });

  it('should reject material registration with duplicate or empty barcode', () => {
    const emptyRes = service.registerMaterial('Item', 'Cat', '   ');
    expect(emptyRes.ok).toBe(false);
    if (!emptyRes.ok) {
      expect(emptyRes.error).toBe('barcodeRequired');
    }

    const first = service.materials()[0];
    const dupRes = service.registerMaterial('Duplicate Item', 'Cat', first.barcode.toLowerCase());
    expect(dupRes.ok).toBe(false);
    if (!dupRes.ok) {
      expect(dupRes.error).toBe('barcodeDuplicate');
    }
  });

  it('should register coworker with auto-generated non-colliding barcode', () => {
    const initialCount = service.coworkers().length;
    const coworker = service.registerCoworker('Julia Silva');
    expect(coworker.name).toBe('Julia Silva');
    expect(coworker.barcode).toMatch(/^EMP-\d{4}$/);
    expect(service.coworkers().length).toBe(initialCount + 1);
    expect(service.findCoworker(coworker.barcode)).toBeDefined();
  });

  it('should perform checkout flow for available material', () => {
    const available = service.materials().find((m) => m.status === 'available');
    expect(available).toBeDefined();
    const coworker = service.coworkers()[0];

    const result = service.perform('checkout', available!.barcode, coworker.id);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.material.status).toBe('checked-out');
      expect(result.material.holderId).toBe(coworker.id);
    }
  });

  it('should fail checkout if material is not available or coworker is missing', () => {
    const checkedOut = service.materials().find((m) => m.status === 'checked-out');
    expect(checkedOut).toBeDefined();

    const coworker = service.coworkers()[0];
    const stateErr = service.perform('checkout', checkedOut!.barcode, coworker.id);
    expect(stateErr.ok).toBe(false);
    if (!stateErr.ok) {
      expect(stateErr.error).toBe('invalidState');
    }

    const available = service.materials().find((m) => m.status === 'available')!;
    const cwErr = service.perform('checkout', available.barcode);
    expect(cwErr.ok).toBe(false);
    if (!cwErr.ok) {
      expect(cwErr.error).toBe('coworkerRequired');
    }
  });

  it('should perform checkin flow for checked-out material', () => {
    const checkedOut = service.materials().find((m) => m.status === 'checked-out')!;
    const result = service.perform('checkin', checkedOut.barcode);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.material.status).toBe('available');
      expect(result.material.holderId).toBeUndefined();
    }
  });

  it('should transition between laundry-in and laundry-out', () => {
    const available = service.materials().find((m) => m.status === 'available')!;
    const inRes = service.perform('laundry-in', available.barcode);
    expect(inRes.ok).toBe(true);
    if (inRes.ok) {
      expect(inRes.material.status).toBe('in-laundry');
    }

    const outRes = service.perform('laundry-out', available.barcode);
    expect(outRes.ok).toBe(true);
    if (outRes.ok) {
      expect(outRes.material.status).toBe('available');
    }
  });

  it('should restore seed state on resetDemo()', () => {
    service.registerCoworker('Temporary Coworker');
    service.resetDemo();
    expect(service.coworkers().some((c) => c.name === 'Temporary Coworker')).toBe(false);
  });
});
