import { Component, Input } from '@angular/core';
import { Root } from 'src/app/shared/models/github-root.model';
import { paginationInformation } from 'src/app/shared/models/paginator.model';
import { GithubApiService } from 'src/app/shared/services/github-api.service';

@Component({
  selector: 'app-show-github-repository',
  templateUrl: './show-github-repository.component.html',
  styleUrls: ['./show-github-repository.component.css']
})
export class ShowGithubRepositoryComponent {
  // recebendo variaveis do home component
  @Input() githubRepositorio:Root;
  @Input() paginator:paginationInformation;
  @Input() searchQuery:string;

  constructor(private api:GithubApiService) { }

  // FUNCAO DO PAGINADOR PARA TROCAR DE PAGINA
  public changePage(event:any):void{
    this.paginator.page = event;
    this.api.getReposWithQuery(this.searchQuery, this.paginator.page, this.paginator.itemsPerPage).subscribe({
      next: (data) => {
        this.githubRepositorio = data;
      }
    })
  }
}
