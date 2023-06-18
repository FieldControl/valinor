import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { searchRepoModel } from 'src/app/core/models/git.model';
import { GitserviceService } from 'src/app/core/services/gitservice.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;

  public allRepos?: searchRepoModel;

  // * paginator configuration * //  
  public total?: number = 0;
  public pageSize: number = 10;
  public pageNumber: number = 1;

  //*Search Repo*//
  public repoName: string = '';

  constructor(private gitserviceService: GitserviceService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.addEnterKeyListener();
  }

  public addEnterKeyListener() {
    this.searchInput.nativeElement.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.repoName) {
        this.gitserviceService.getSearchReposGitHub(this.repoName, this.pageNumber, this.pageSize).subscribe((response) => {
          console.log(response);
          if (response) {
            this.allRepos = response;
            this.gitserviceService.getReposGitHub.emit([this.allRepos, this.repoName]);
          }
        });
      }
    });
  }

}
