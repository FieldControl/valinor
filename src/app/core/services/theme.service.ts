import { Injectable } from '@angular/core';
import { Theme } from '@core/enums/theme.enum';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private THEME_KEY = 'theme';
  currentTheme?: string;

  constructor() {
    this.currentTheme = this.getCurrentThemeFromStorage();
    this.setThemeOnLoading(this.currentTheme);
  }

  get htmlTag() {
    return document.getElementsByTagName('html').item(0)!;
  }

  private getCurrentThemeFromStorage() {
    return localStorage.getItem(this.THEME_KEY) ?? Theme.light;
  }

  private setThemeInStorage(theme: string) {
    this.currentTheme = theme;
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private setThemeOnLoading(theme: string) {
    if (theme) {
      this.htmlTag.classList.toggle(theme);
    }
  }

  isDarkTheme() {
    return this.currentTheme === Theme.dark;
  }

  toggleTheme() {
    var isDarkTheme = this.htmlTag.classList.toggle(Theme.dark);
    this.setThemeInStorage(isDarkTheme ? Theme.dark : Theme.light);
  }
}
