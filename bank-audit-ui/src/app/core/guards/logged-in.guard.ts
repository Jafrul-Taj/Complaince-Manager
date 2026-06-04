import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Applied to the /login route.
 *
 * If an authenticated user tries to reach /login (e.g. by manually typing the
 * URL, or if a back-navigation slips through), redirect them straight to their
 * role's home page so they never see the login screen while logged in.
 */
export const loggedInGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true; // Not logged in → show login page normally

  // Already authenticated — send to role home
  switch (auth.role()) {
    case 'Operator':          return router.createUrlTree(['/app/dashboard']);
    case 'ComplianceOfficer': return router.createUrlTree(['/app/my-assignments']);
    case 'ComplianceHead':    return router.createUrlTree(['/app/dashboard']);
    default:                  return router.createUrlTree(['/app/dashboard']);
  }
};
