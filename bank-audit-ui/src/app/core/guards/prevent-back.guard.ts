import { inject } from '@angular/core';
import { CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { SessionLeaveDialogComponent } from '../../shared/session-leave-dialog/session-leave-dialog.component';

/**
 * Applied to the /app parent route (MainLayoutComponent).
 *
 * Fires ONLY when Angular is about to navigate the user completely OUT of the
 * /app/** tree — e.g. browser back-button landing on /login, or manually
 * typing a different URL.  It does NOT fire for navigation between /app/
 * child routes (dashboard → users, etc.).
 *
 * Explicit logout bypasses the dialog via AuthService.bypassNavigationGuard.
 */
export const preventBackGuard: CanDeactivateFn<unknown> = (
  _component: unknown,
  _currentRoute,
  _currentState,
  nextState?: RouterStateSnapshot
) => {
  const auth   = inject(AuthService);
  const dialog = inject(MatDialog);

  // ── 1. Explicit logout — skip the dialog ─────────────────────────────────
  if (auth.bypassNavigationGuard) {
    auth.bypassNavigationGuard = false; // consume the flag
    return true;
  }

  // ── 2. If the user is no longer authenticated — allow navigation freely ──
  //    (e.g. session was already cleared by token expiry)
  if (!auth.isLoggedIn()) return true;

  // ── 3. If navigating to /login while authenticated — redirect to app
  //    instead of showing the dialog (the loggedInGuard will also catch this,
  //    but defence-in-depth is harmless here).
  if (nextState?.url === '/login' || nextState?.url === '/') {
    // Let the guard cancel this navigation; loggedInGuard handles the rest.
    return false;
  }

  // ── 4. For all other exits (external-ish routes, unknown paths) — show the
  //    confirmation dialog.
  const ref = dialog.open(SessionLeaveDialogComponent, {
    width: '420px',
    maxWidth: '95vw',
    disableClose: true,        // user must pick an option
    autoFocus: 'first-tabbable',
    panelClass: 'sld-panel',
  });

  return ref.afterClosed().pipe(
    map((leave: boolean) => !!leave)
  );
};
