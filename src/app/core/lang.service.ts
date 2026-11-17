import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

export const LANGS = [
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
] as const;

const KEY = 'uniflow.lang';
const DEFAULT_LANG = 'en';

@Injectable({ providedIn: 'root' })
export class LangService {
  private transloco = inject(TranslocoService);
  readonly current = signal<string>(DEFAULT_LANG);

  /**
   * Uses `uniflow.lang` from localStorage if previously set in Settings;
   * otherwise detects the browser language (pt -> pt-BR, es -> es, en -> en) and falls back to English.
   */
  init() {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}

    if (saved && LANGS.some((l) => l.code === saved)) {
      this.apply(saved);
      return;
    }

    this.apply(this.detectBrowserLang());
  }

  /** Called from the Settings page to persist the user's chosen language. */
  set(lang: string) {
    this.apply(lang);
    try {
      localStorage.setItem(KEY, lang);
    } catch {}
  }

  get active() {
    return this.transloco.getActiveLang();
  }

  private apply(lang: string) {
    this.current.set(lang);
    this.transloco.setActiveLang(lang);
    document.documentElement.lang = lang;
  }

  private detectBrowserLang(): string {
    if (typeof navigator === 'undefined') return DEFAULT_LANG;
    const raw = (navigator.language || navigator.languages?.[0] || '').toLowerCase();
    if (raw.startsWith('pt')) return 'pt-BR';
    if (raw.startsWith('es')) return 'es';
    if (raw.startsWith('en')) return 'en';
    return DEFAULT_LANG;
  }
}
