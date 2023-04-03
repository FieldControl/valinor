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
    this.applyTheme();
  }

  toggleTheme() {
    this.DarkTheme = !this.DarkTheme;
    this.applyTheme();
  }

  applyTheme() {
    // Seleciona o elemento img com a classe theme-icon
    const themeIcon = document.querySelector('img.theme-icon');

    if (this.DarkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      // Adiciona a classe rotate ao elemento
      if (themeIcon) themeIcon.classList.add('rotate');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      // remove a classe rotate ao elemento
      if (themeIcon) themeIcon.classList.remove('rotate');
    }
  }
}
