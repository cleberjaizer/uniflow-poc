import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const LANGS = [
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

const KEY = 'uniflow.lang';
const DEFAULT_LANG = 'pt-BR';

@Injectable({ providedIn: 'root' })
export class LangService {
  private transloco = inject(TranslocoService);

  /** Portuguese (BR) is the default; a language the user picked earlier is remembered. */
  init() {
    let lang: string | null = null;
    try {
      lang = localStorage.getItem(KEY);
    } catch {}
    this.set(LANGS.some((l) => l.code === lang) ? lang! : DEFAULT_LANG);
  }

  set(lang: string) {
    this.transloco.setActiveLang(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {}
  }

  get active() {
    return this.transloco.getActiveLang();
  }
}
