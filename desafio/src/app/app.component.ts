import { Component, OnInit } from '@angular/core';
import { GithubService } from './shared/service/github.service';
import { IRepo } from './shared/model/IRepo';
import { faStar, faEye, faCircleDot, faCircleChevronRight, faCircleChevronLeft, faCircleRight, faCircleLeft } from '@fortawesome/free-solid-svg-icons'; // importação dos ícones de stars, watchers e issues


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  // criação dos ícones a ser utilizados para stars, issues e watchers
  faStar = faStar;
  faEye = faEye;
  faCircleDot = faCircleDot;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleRight = faCircleRight;
  faCircleLeft = faCircleLeft;
  page = 0;
  pageN = 0;

  repos: IRepo[] = []; // criação de um array do tipo repo (resposta com atributos do repositório) para ser utilizado na chamada no html


  constructor(public githubSearch: GithubService){}


  getRepos(keyword: string){ // função que retorna os dados dos repositórios no array criado
    this.page = 0; // seta a var de número da página em 0 (primeira página)
    this.githubSearch.searchRepobyKeyword(keyword, this.page).subscribe(
      data => {
        this.pageN = Math.ceil((data.total_count/30)); // cálculo para saber quantas páginas existem levando em conta que existem 30 itens em cada array/página
        this.repos = data.items; // atribui o valor dos dados ao array
        console.log(this.repos); // console.log do valor contido no array de repositórios
        console.log(data);
        console.log(this.pageN);
      }
    )
  }

  getReposNextPage(keyword: string){ // função que retorna a próxima página da requisição
    this.page += 1; // seta a var de número da página em +1 em relação ao valor anterior
    this.githubSearch.searchRepobyKeyword(keyword, this.page).subscribe(
      data => {
        this.repos = data.items; // atribui o valor dos dados ao array
        console.log(this.repos) // console.log do valor contido no array de repositórios
      }
    )
  }

  getReposPrevPage(keyword: string){ // função que retorna a página anterior da requisição
    this.page -= 1; // seta a var de número da página em -1 em relação ao valor anterior
    this.githubSearch.searchRepobyKeyword(keyword, this.page).subscribe(
      data => {
        this.repos = data.items; // atribui o valor dos dados ao array
        console.log(this.repos) // console.log do valor contido no array de repositórios
      }
    )
  }

  getReposLastPage(keyword: string){ // função que retorna a última página da requisição
    this.githubSearch.searchRepobyKeyword(keyword, this.pageN).subscribe(
      data => {
        this.repos = data.items; // atribui o valor dos dados ao array
        console.log(this.repos) // console.log do valor contido no array de repositórios
        console.log(this.pageN);
      }
    )
  }


}
