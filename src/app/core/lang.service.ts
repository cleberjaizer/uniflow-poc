import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'es', label: 'Español' },
] as const;

const KEY = 'uniflow.lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  private transloco = inject(TranslocoService);

  init() {
    let lang: string | null = null;
    try {
      lang = localStorage.getItem(KEY);
    } catch {}
    if (!lang) {
      const nav = navigator.language || 'en';
      lang = LANGS.find((l) => l.code.toLowerCase() === nav.toLowerCase())?.code
        ?? LANGS.find((l) => l.code.split('-')[0] === nav.split('-')[0])?.code
        ?? 'en';
    }
    this.set(lang);
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
