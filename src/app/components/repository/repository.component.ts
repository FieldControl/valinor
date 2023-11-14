import { Component, OnInit, OnDestroy } from '@angular/core';
import { GetDataApiGitHub } from '../../services/get-service';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.css']
})

export class RepositoryComponent implements OnInit, OnDestroy {
  repo: any;
  contributors$ = of(null);
  branches$ = of(null);
  collaborators$ = of(null);
  private subscript!: Subscription;

  isLoading: boolean = false

  constructor(
    private route: ActivatedRoute,
    private repoService: GetDataApiGitHub,
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    const userName = this.route.snapshot.paramMap.get('name');
    const repo = this.route.snapshot.paramMap.get('repo');

    if (!userName) {
      return;
    }

    /*-- Function responsible for making queries on other API urls --*/
    this.subscript = this.repoService.getRepoDetails(userName + '/' + repo).subscribe((data) => {
      if (data) {
        this.repo = data;
        this.contributors$ = this.repoService.getDataByURL(data.contributors_url);
        this.branches$ = this.repoService.getDataByURL(data.branches_url.replace("{/branch}", ""));
        this.collaborators$ = this.repoService.getDataByURL(data.contributors_url);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscript) {
      this.subscript.unsubscribe();
    }
  }

}
