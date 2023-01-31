import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { GithubService } from './shared/service/github.service';
import { IRepo } from './shared/model/IRepo';
import { faStar, faEye, faCircleDot } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{

  faStar = faStar;
  faEye = faEye;
  faCircleDot = faCircleDot;

  repos: IRepo[] = [];


  constructor(public githubSearch: GithubService){}


  getRepos(keyword: string){
    this.githubSearch.searchRepobyKeyword(keyword).subscribe(
      data => {
        this.repos = data.items;
        console.log(this.repos)
        console.log(data)
      }
    )
  }

  /*public async searchRepos(keyword: string){

    this.githubSearch.searchRepobyKeyword(keyword)
      .subscribe(result=>{
        console.log(result);
      });
  }*/

  /*public async buscaGithub(searchTerm: string){
    let url : string = `https://api.github.com/search/repositories?q=${searchTerm}`

    const req = this.http.get<any>(url);
    req.subscribe(result=>{
      console.log(result)
    });

  }*/

}
