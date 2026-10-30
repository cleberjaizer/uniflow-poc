import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  // Relative URL so it resolves against <base href> (works on GitHub Pages sub-paths).
  getTranslation(lang: string) {
    return this.http.get<Translation>(`assets/i18n/${lang}.json`);
  }
}
