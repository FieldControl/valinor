import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RepositoriesService } from '../services/repositories.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit {
  constructor(private repositoriesService: RepositoriesService) {}

  searchForm: any;
  searchResult: any;

  ngOnInit(): void {
    this.searchForm = new FormGroup({
      search: new FormControl(''),
    });
  }

  onSubmit(): void {
    console.log(this.searchForm.value.search);
    this.repositoriesService
      .getReposOnSearch(this.searchForm.value.search)
      .subscribe((res) => {
        console.log(res);
        return (this.searchResult = res);
      });
  }
}
