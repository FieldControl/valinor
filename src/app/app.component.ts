import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Marvel';

  DarkTheme = false;

  constructor() {
    (window as any).appComponent = this;
    this.applyTheme();
  }

  toggleTheme() {
    this.DarkTheme = !this.DarkTheme;
    this.applyTheme();
  }

  applyTheme() {
    // Seleciona o elemento img com a classe theme-icon
    const themeIcon = document.querySelector('img.theme-icon');
    const components = document.querySelectorAll('.theme-switcher');

    if (this.DarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      // Adiciona a classe rotate ao elemento
      if (themeIcon) themeIcon.classList.add('rotate');
      components.forEach((component) => {
        component.classList.add('dark-theme');
        component.querySelectorAll('*').forEach((child) => {
          child.classList.add('dark-theme');
        });
      });
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      // remove a classe rotate ao elemento
      if (themeIcon) themeIcon.classList.remove('rotate');
      components.forEach((component) => {
        component.classList.remove('dark-theme');
        component.querySelectorAll('*').forEach((child) => {
          child.classList.remove('dark-theme');
        });
      });
    }
  }
}
