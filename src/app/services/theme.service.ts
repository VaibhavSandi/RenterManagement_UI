import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  public theme$ = this.themeSubject.asObservable();
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initTheme();
  }

  private initTheme(): void {
    if (this.isBrowser) {
      const savedTheme = localStorage.getItem('theme-preference') || 'light';
      this.setTheme(savedTheme);
    }
  }

  public toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  public setTheme(theme: string): void {
    this.themeSubject.next(theme);
    if (this.isBrowser) {
      localStorage.setItem('theme-preference', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }

  public get currentTheme(): string {
    return this.themeSubject.value;
  }
}
