import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withRouterConfig,
} from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes }         from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AppTitleStrategy } from './core/title.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({
        /**
         * When CanDeactivate returns false (e.g. user clicks "Stay Here" in the
         * confirmation dialog after pressing the browser back-button), Angular
         * uses 'computed' resolution to call history.forward() and restore the
         * correct URL in the address bar — without the 'computed' option the URL
         * could briefly show the destination route before being corrected.
         */
        canceledNavigationResolution: 'computed',
      })
    ),
    provideAnimations(),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
