import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GithubService } from '../../services/github.service';

@Component({
  selector: 'app-repositories-list',
  templateUrl: './repositories-list.component.html',
  styleUrls: ['./repositories-list.component.scss']
})
export class RepositoriesListComponent implements OnInit {
  
  constructor(
    private router: Router,
    private service: GithubService
  ){}
  
  ngOnInit(): void {}

  public chamaAPI() : void{
    this.service.getRepositories("cellbit", 1).subscribe((res)=> {
      let username = res.items[0].owner.login;
      let reponame = res.items[0].name;
      this.issuesReportadas(username, reponame)
    })
  }

  public issuesReportadas(username:string, reponame:string): void {
    this.router.navigate([`/issue`, username, reponame]);
  }
}
