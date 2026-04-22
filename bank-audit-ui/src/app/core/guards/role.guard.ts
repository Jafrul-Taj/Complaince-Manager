import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.role();

  if (userRole && allowedRoles.includes(userRole)) return true;

  // Redirect to the role's home page
  switch (userRole) {
    case 'Operator':          router.navigate(['/app/users']); break;
    case 'ComplianceOfficer': router.navigate(['/app/findings']); break;
    default:                  router.navigate(['/app/dashboard']); break;
  }
  return false;
};
