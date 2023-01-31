import { Component, OnInit } from '@angular/core';
import { GithubService } from './shared/service/github.service';
import { IRepo } from './shared/model/IRepo';
import { faStar, faEye, faCircleDot } from '@fortawesome/free-solid-svg-icons'; // importação dos ícones de stars, watchers e issues


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

  repos: IRepo[] = []; // criação de um array do tipo repo (resposta com atributos do repositório) para ser utilizado na chamada no html


  constructor(public githubSearch: GithubService){}


  getRepos(keyword: string){ // função que retorna os dados dos repositórios no array criado
    this.githubSearch.searchRepobyKeyword(keyword).subscribe(
      data => {
        this.repos = data.items; // atribui o valor dos dados ao array
        console.log(this.repos) // console.log do valor contido no array de repositórios
      }
    )
  }
}
