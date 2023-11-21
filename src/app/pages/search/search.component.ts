import { Component, OnInit } from '@angular/core';
import { Repository } from 'src/app/models/repository';
import { GithubService } from 'src/app/services/github.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private githubService : GithubService){}

  page : number = 1;
  perPage : number = 5;
  search : string = "kaiogotyacodeeee";

  repositories? : Repository;

  ngOnInit(): void {
    this.githubService.getRepositories(this.page,this.perPage,this.search).subscribe(x =>{
      if(x.items.length > 0){
        this.repositories = x;
      }
    })
  }  

}
