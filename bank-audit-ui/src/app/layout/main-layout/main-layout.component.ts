import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../core/services/auth.service';

/**
 * Shell for all /app/** routes.
 *
 * Responsibilities beyond layout:
 *  - `beforeunload` listener: shows the browser's native "Leave site?" dialog
 *    when the user tries to close the tab, hard-refresh, or navigate to an
 *    external URL.  This is separate from the CanDeactivate dialog (which
 *    handles Angular router navigations only).
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  /**
   * Fired by the browser before the page is unloaded (tab close, hard refresh,
   * navigation to an external URL, or address-bar change that exits the SPA).
   *
   * Returning any non-undefined value triggers the browser's built-in
   * "Leave site? Changes you made may not be saved." prompt.
   *
   * We only show this when the user is still authenticated; if the session has
   * already been cleared (explicit logout), we let the page unload silently.
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): string | undefined {
    if (!this.auth.isLoggedIn() || this.auth.bypassNavigationGuard) {
      return undefined; // silent — user already logged out or is logging out
    }
    // The browser ignores the return-value string in modern Chrome/Firefox but
    // still shows its own generic dialog; setting preventDefault() also works.
    event.preventDefault();
    const message = 'Your session will remain active. Are you sure you want to leave?';
    event.returnValue = message; // legacy support (IE / older Edge)
    return message;
  }
}
