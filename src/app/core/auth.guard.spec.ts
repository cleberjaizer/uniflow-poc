import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { authGuard, roleGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('Guards', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  describe('authGuard', () => {
    it('should redirect to /login if unauthenticated', () => {
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/login');
    });

    it('should allow navigation if user is logged in', () => {
      authService.login('andre.kreitlow@gmail.com');
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  describe('roleGuard', () => {
    it('should redirect unauthenticated user to /login', () => {
      const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/login');
    });

    it('should redirect regular user to /dashboard when accessing admin route', () => {
      authService.login('andre.kreitlow@gmail.com'); // role: 'user'
      const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/dashboard');
    });

    it('should allow admin user to access admin route', () => {
      authService.login('cleber.jaizer@gmail.com'); // role: 'admin'
      const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
      expect(result).toBe(true);
    });

    it('should allow any logged-in user if no roles specified on route', () => {
      authService.login('andre.kreitlow@gmail.com');
      const route = { data: {} } as unknown as ActivatedRouteSnapshot;
      const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));
      expect(result).toBe(true);
    });
  });
});
