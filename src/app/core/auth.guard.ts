import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from './models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.user() ? true : inject(Router).createUrlTree(['/login']);
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.user()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (auth.hasRole(requiredRoles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
