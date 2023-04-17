import { Component, Input } from '@angular/core';
import { MarvelSearchService } from '../marvel-search.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-result-view',
  templateUrl: './result-view.component.html',
  styleUrls: ['./result-view.component.css']
})
export class ResultViewComponent {
  @Input() selectedType: string = 'characters';
  @Input() resultsPerPage: number = 5;
  @Input() searchText: string = '';

  totalResults: number = 0;
  results: any[] = [];

  constructor(
    private marvelSearchService: MarvelSearchService
  ) {}

  ngOnInit() {
    this.updateResults();
  }

  ngOnChanges() {
    this.updateResults();
  }

  updateResults(pageIndex?: number) {
    if (!pageIndex) {
      pageIndex = 0;
    }

    if (this.selectedType) {this.searchText
      if (this.searchText) {
        this.marvelSearchService
        .getResults(this.selectedType, this.resultsPerPage, pageIndex, this.searchText)
          // Subscreve no observer para receber o resultado da função assíncrona quando ficar pronto
          .subscribe( ({results,totalResults}) => {
            this.results = results;
            // atualiza o valor da propriedade total results com base no valor retornado pelo serviço
            this.totalResults = totalResults;
          });
      } else {
        this.marvelSearchService
        .getResults(this.selectedType, this.resultsPerPage , pageIndex)
          // Subscreve no observer para receber o resultado da função assíncrona quando ficar pronto
          .subscribe( ({results,totalResults}) => {
            this.results = results;
            // atualiza o valor da propriedade total results com base no valor retornado pelo serviço
            this.totalResults = totalResults;
          });
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