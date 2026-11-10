import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
  });

  it('should initialize with null user when storage is empty', () => {
    expect(service.user()).toBeNull();
    expect(service.role()).toBeNull();
    expect(service.isAdmin()).toBe(false);
  });

  it('should login admin user (cleber.jaizer@gmail.com) with full privileges', () => {
    const success = service.login('  Cleber.Jaizer@gmail.com  ');
    expect(success).toBe(true);
    expect(service.user()?.email).toBe('cleber.jaizer@gmail.com');
    expect(service.user()?.role).toBe('admin');
    expect(service.role()).toBe('admin');
    expect(service.isAdmin()).toBe(true);
    expect(service.hasRole(['admin'])).toBe(true);
    expect(service.hasRole(['user'])).toBe(false);
  });

  it('should login regular user (andre.kreitlow@gmail.com) with limited privileges', () => {
    const success = service.login('andre.kreitlow@gmail.com');
    expect(success).toBe(true);
    expect(service.user()?.email).toBe('andre.kreitlow@gmail.com');
    expect(service.user()?.role).toBe('user');
    expect(service.role()).toBe('user');
    expect(service.isAdmin()).toBe(false);
    expect(service.hasRole(['admin'])).toBe(false);
    expect(service.hasRole(['user'])).toBe(true);
  });

  it('should reject unauthorized email', () => {
    const success = service.login('unknown@company.com');
    expect(success).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should reject empty email on login', () => {
    const success = service.login('   ');
    expect(success).toBe(false);
    expect(service.user()).toBeNull();
  });

  it('should logout and clear storage', () => {
    service.login('cleber.jaizer@gmail.com');
    expect(service.user()).not.toBeNull();
    service.logout();
    expect(service.user()).toBeNull();
    expect(service.role()).toBeNull();
  });
});
