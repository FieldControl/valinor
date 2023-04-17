import { Component, Input } from '@angular/core';
import { MarvelSearchService } from '../marvel-search.service';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { ViewChild } from '@angular/core'

enum TypeOfSearch {
  searchAll,
  searchByText
}

@Component({
  selector: 'app-result-view',
  templateUrl: './result-view.component.html',
  styleUrls: ['./result-view.component.css']
})
export class ResultViewComponent {
  @Input() selectedType: string = 'characters';
  @Input() resultsPerPage: number = 5;
  @Input() searchText: string = '';
  @ViewChild('paginator') paginator!: MatPaginator;

  totalResults: number = 0;
  results: any[] = [];

  oldSearchType: TypeOfSearch = TypeOfSearch.searchAll;
  oldSearchText: string = '';

  constructor(
    private marvelSearchService: MarvelSearchService
  ) {}

  ngOnInit() {
    this.updateResults();
  }

  ngOnChanges() {
    this.updateResults();
  }

  firstPagePaginator() {
    if (this.paginator)
      this.paginator.firstPage();
  }

  updateResults(pageIndex?: number) {
    if (!pageIndex) {
      pageIndex = 0;
    }

    if (this.selectedType) {
      if (this.searchText) {
        if( (this.oldSearchType == TypeOfSearch.searchAll) || (this.searchText != this.oldSearchText) )
          this.firstPagePaginator(); 
        this.marvelSearchService
        .getResults(this.selectedType, this.resultsPerPage, pageIndex, this.searchText)
          // Subscreve no observer para receber o resultado da função assíncrona quando ficar pronto
          .subscribe( ({results,totalResults}) => {
            this.results = results;
            // atualiza o valor da propriedade total results com base no valor retornado pelo serviço
            this.totalResults = totalResults;
          });
        this.oldSearchType = TypeOfSearch.searchByText;
        this.oldSearchText = this.searchText;
      } else {
        if(this.oldSearchType == TypeOfSearch.searchByText)
          this.firstPagePaginator();
        this.marvelSearchService
        .getResults(this.selectedType, this.resultsPerPage, pageIndex)
          // Subscreve no observer para receber o resultado da função assíncrona quando ficar pronto
          .subscribe( ({results,totalResults}) => {
            this.results = results;
            // atualiza o valor da propriedade total results com base no valor retornado pelo serviço
            this.totalResults = totalResults;
          });
        this.oldSearchType = TypeOfSearch.searchAll;
      }
    }
  }

   // adiciona um método para lidar com mudanças de página
   onPageChange(event: PageEvent) {
    const pageIndex = event.pageIndex;
    // atualiza os resultados com base na página selecionada
    this.updateResults(pageIndex);
  }
}