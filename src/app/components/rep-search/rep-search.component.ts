import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RepositoryService } from 'src/app/services/repository.service';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-rep-search',
  templateUrl: './rep-search.component.html',
  styleUrls: ['./rep-search.component.scss'],
})
export class RepSearchComponent implements OnInit {
  public inputSearchValue = new FormControl();
  public repositories: any = [];
  public searchIcon = faMagnifyingGlass;
  public starIcon = faStar;
  public page: number = 1;

  constructor(private repositoryService: RepositoryService) {}

  ngOnInit(): void {}

  async onSearch(){
    await this.repositoryService.onSearch(this.inputSearchValue).subscribe((response: any) => {
      console.log(response)
      this.repositories = response
    });
  }
}
