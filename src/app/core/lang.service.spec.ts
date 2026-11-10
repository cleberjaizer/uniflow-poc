import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LANGS, LangService } from './lang.service';

describe('LangService', () => {
  let service: LangService;
  let translocoMock: {
    setActiveLang: ReturnType<typeof vi.fn>;
    getActiveLang: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();
    translocoMock = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn().mockReturnValue('pt-BR'),
    };

    TestBed.configureTestingModule({
      providers: [LangService, { provide: TranslocoService, useValue: translocoMock }],
    });

    service = TestBed.inject(LangService);
  });

  it('should initialize with default language pt-BR when storage is empty', () => {
    service.init();
    expect(translocoMock.setActiveLang).toHaveBeenCalledWith('pt-BR');
    expect(document.documentElement.lang).toBe('pt-BR');
  });

  it('should initialize with saved language from localStorage if valid', () => {
    localStorage.setItem('uniflow.lang', 'es');
    service.init();
    expect(translocoMock.setActiveLang).toHaveBeenCalledWith('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('should set new language, update documentElement and persist to storage', () => {
    service.set('en');
    expect(translocoMock.setActiveLang).toHaveBeenCalledWith('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('uniflow.lang')).toBe('en');
  });

  it('should expose available languages', () => {
    expect(LANGS.map((l) => l.code)).toEqual(['pt-BR', 'en', 'es']);
  });
});
