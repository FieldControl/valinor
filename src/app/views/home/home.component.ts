import { Component } from '@angular/core';
import { GithubApiService } from 'src/app/shared/services/github-api.service';
import { Root } from 'src/app/shared/models/github-root.model';
import { paginationInformation } from 'src/app/shared/models/paginator.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {
  // opcoes do paginator
  // listados aqui para personalizar mais facilmente
  private paginaInicial:number = 1; // indica por qual pagina comecar
  private itensPorPagina: number = 12; // indica o numero de elementos por pagina

  // elementos da paginacao
  public paginator:paginationInformation = new paginationInformation(this.paginaInicial, this.itensPorPagina);

  // declaracao de variaveis para serem usadas
  public searchQuery:string;
  public githubRepositorio:Root;
  public mensagemErro:string;

  constructor(private githubapi:GithubApiService) { }

  // metodo para pegar repositorios usando service e um query inserido pelo usuario
  // para depois mostrar na html 'show-github-repository'
  public pegarRepositorios(){
    // sempre que pesquisar um novo repositorio, voltar para pagina 1
    this.paginator.page = 1;
    /// usando o service para pegar o json e colocar no model
    this.githubapi.getReposWithQuery(this.searchQuery, this.paginator.page, this.paginator.itemsPerPage).subscribe({
      next:(data) => {
        this.githubRepositorio = data;
        // fazendo um teste para ver se há mais de 1000 resultados, já que o api mostra apenas os primeiros 1000 resultados
        if(data.total_count > 1000)
          this.paginator.totalCount = 1000;
        else
          this.paginator.totalCount = data.total_count; //caso nao tenha mais de 1000, mostrar todos
      },
      error:(error) => {
        this.mensagemErro = error;
        console.log(this.mensagemErro);
      }
    });
  }
}
