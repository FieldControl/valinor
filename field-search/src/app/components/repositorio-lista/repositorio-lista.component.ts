import { Component, OnInit } from '@angular/core';
import { GithubService } from 'src/app/services/githubService/github-service.service';

@Component({
  selector: 'app-repositorio-lista',
  templateUrl: './repositorio-lista.component.html',
  styleUrls: ['./repositorio-lista.component.css'],
})
export class RepositorioListaComponent implements OnInit {
  //Declaração de variáveis
  public repetirItems = new Array(10);
  repositorios: any[] = [];
  query: string = '';
  searchMade: boolean = false;
  totalRepositorios: number = 0;
  isLoading: boolean = false;

  constructor(public githubService: GithubService) {}

  //Ponto de partida do código do método / se-inscrevendo nos observaveis para sempre atualizar os dados constantemente

  ngOnInit(): void {
    this.githubService.currentRepositorios.subscribe(
      (repositorios) => (this.repositorios = repositorios)
    );
    this.githubService.searchMade.subscribe(
      (searchMade) => (this.searchMade = searchMade)
    );
    this.githubService.isLoading.subscribe(
      (isLoading) => (this.isLoading = isLoading)
    );
    this.githubService.totalRepositorios.subscribe(
      (totalRepositorios) => (this.totalRepositorios = totalRepositorios)
    );
  }

  //Ação de quando o botão de proxima pagina for apertado
  onNextPage(): void {
    this.githubService.page++;
    this.githubService.searchRepositorios(this.githubService.query);
    window.scrollTo(0, 0);
  }

  //Ação de quando o botão de pagina anterior for apertado
  onPrevPage(): void {
    if (this.githubService.page > 1) {
      this.githubService.page--;
      this.githubService.searchRepositorios(this.githubService.query);
      window.scrollTo(0, 0);
    }
  }
}