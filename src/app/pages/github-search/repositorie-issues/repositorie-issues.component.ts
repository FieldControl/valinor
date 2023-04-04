import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GithubService } from '../../services/github.service';
import { PageEvent } from '@angular/material/paginator';
import { Issues } from '../../../models/issues.model';

@Component({
  selector: 'app-repositorie-issues',
  templateUrl: './repositorie-issues.component.html',
  styleUrls: ['./repositorie-issues.component.scss']
})
export class RepositorieIssuesComponent implements OnInit {

  public username: string | null = "";
  public reponame: string | null = "";

  public issues: Issues = {} as Issues;

  length = 0;
  pageSize = 0;
  pageIndex = 0;

  hidePageSize = true;
  showFirstLastButtons = true;
  disabled = false;

  pageEvent!: PageEvent;

  constructor(
    public router: Router,
    public routeParam: ActivatedRoute,
    private service: GithubService,
  ) { }

  ngOnInit(): void {
    this.routeParam.paramMap.subscribe(repo => {
      this.username = repo.get("username");
      this.reponame = repo.get("reponame");
      this.resgataIssues(1);
    })
  }

  resgataIssues(page: number) {
    if (this.username != null && this.reponame != null) {
      this.service.getIssues(this.username!, this.reponame!, page).subscribe(res => {
        this.issues = res;
        //A Api só retorna os primeiros 1000 resultados
        this.length = this.issues.total_count > 1000 ? 1000 : this.issues.total_count;
        //O tamanho da página será proporcional a quantidade de repositórios encontratados
        this.pageSize = this.issues.total_count > 30 ? 30 : this.issues.total_count;
      })
    }
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.pageIndex = e.pageIndex;

    this.resgataIssues(this.pageIndex + 1);

    this.length = e.length;
    this.pageSize = e.pageSize;

  }

}
