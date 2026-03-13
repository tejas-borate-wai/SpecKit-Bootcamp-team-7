import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectUserRole } from '../store/session/session.selectors';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) return true;

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (role && allowedRoles.includes(role)) return true;
      return router.createUrlTree(['/unauthorized']);
    })
  );
};
