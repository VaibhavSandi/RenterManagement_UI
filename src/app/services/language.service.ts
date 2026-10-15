import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Lang, translations } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'frm_lang';

  private _lang = new BehaviorSubject<Lang>(this.getSavedLang());
  lang$ = this._lang.asObservable();

  get currentLang(): Lang {
    return this._lang.value;
  }

  private getSavedLang(): Lang {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'mr' ? 'mr' : 'en';
  }

  toggle(): void {
    const next: Lang = this._lang.value === 'en' ? 'mr' : 'en';
    this._lang.next(next);
    localStorage.setItem(this.STORAGE_KEY, next);
  }

  setLang(lang: Lang): void {
    this._lang.next(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
  }

  /** Translate a key. Falls back to key name if not found. */
  t(key: string): string {
    return translations[this._lang.value]?.[key] ?? translations['en'][key] ?? key;
  }
}
