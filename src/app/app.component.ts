import { Component } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Marvel';
  selectedType: string = 'characters';
  resultsPerPage: number = 5;
  searchText: string = '';

  DarkTheme = false;
  
  constructor(private matPaginatorIntl: MatPaginatorIntl) {
    // Expondo para testes do Cypress
    (window as any).appComponent = this;
    this.applyTheme();

    // define um valor personalizado para a propriedade itemsPerPageLabel
    this.matPaginatorIntl.itemsPerPageLabel = 'Itens por página:';
    this.matPaginatorIntl.previousPageLabel = 'Página anterior';
    this.matPaginatorIntl.nextPageLabel = 'Próxima página';
    this.matPaginatorIntl.lastPageLabel = 'Última página';
    this.matPaginatorIntl.firstPageLabel = 'Primeira página';
    this.matPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 de ${length}`;
      }

      length = Math.max(length, 0);


      // Se exceder o tamanho máximo joga em zero (ao dar switch de tipos)
      const startIndex = page * pageSize > length ? 0 : page * pageSize;

      // Se o tamanho final exceder colocar o tamanho máximo possível
      const endIndex = startIndex + pageSize > length ? length : startIndex + pageSize;

      return `${startIndex + 1} - ${endIndex} de ${length}`;
    }
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
      });
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      // remove a classe rotate ao elemento
      if (themeIcon) themeIcon.classList.remove('rotate');
      components.forEach((component) => {
        component.classList.remove('dark-theme');
      });
    }
  }

  onSelectionChange(selectedType: string) {
    this.selectedType = selectedType
  }

  onOptionsChange(resultsPerPage: number){
    this.resultsPerPage = resultsPerPage;
  }

  onSearchChanged(searched: string){
    this.searchText = searched;
  }
}
