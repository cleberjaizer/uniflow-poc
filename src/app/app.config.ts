import { ApplicationConfig, inject, isDevMode, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { TranslocoHttpLoader } from './core/transloco-loader';
import { LangService } from './core/lang.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Hash routing keeps deep links working on GitHub Pages (no server rewrites).
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideTransloco({
      config: {
        availableLangs: ['en', 'pt-BR', 'es'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LangService).init()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
