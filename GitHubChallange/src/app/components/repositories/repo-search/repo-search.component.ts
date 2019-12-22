import { Component, OnInit } from '@angular/core';
import { RepositoryService } from 'src/app/services/repository.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Repository } from 'src/app/models/repository.model';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { RepositorySearchResult } from 'src/app/models/repository-search-result.model';

@Component({
  selector: 'app-repo-search',
  templateUrl: './repo-search.component.html',
  styleUrls: ['./repo-search.component.css']
})
export class RepoSearchComponent implements OnInit {
  myForm: FormGroup;
  submitted = false;
  public repositoryList: Repository[] = [];
  public error: string;
  public links: string;

  public totalItems:number = 0;
  currentPage: number = 1;

  constructor(private repoService: RepositoryService,
              private formbuild: FormBuilder) {
    this.reactiveForm();
  }

  reactiveForm() {
    this.myForm = this.formbuild.group({
      searchName: ['', Validators.minLength(3) ]
    });
  }
  get f() { return this.myForm.controls; }

  submitForm(formData) {
    this.repoService.searchRepositoriesByName2(this.f.searchName.value)
    .subscribe(
      (data: HttpResponse<RepositorySearchResult>) => {

        this.links= data.headers.get("Link");
        this.submitted = true; 
        const { total_count: totalCount, items } = data.body;

        if (totalCount > 0) {
          this.repositoryList = items;
          this.totalItems = 1000;
          //this.getPage(1);
        } else {
          this.repositoryList = [];
          this.error = 'Not found. Please try again or use a different name is the search input above.';
        }
      },
      (err: HttpErrorResponse) => {
        this.submitted = true;
        this.error = err.statusText;
      }
    );    
 }

  ngOnInit() {
    
  }
  getPage(page: number) {
    if(this.f.searchName.value != ''){
      this.repoService.searchRepositoriesByNameWithPage(this.f.searchName.value,page)
      .subscribe(
        (data: HttpResponse<RepositorySearchResult>) => {

          this.links= data.headers.get("Link");
          this.submitted = true; 
          const { total_count: totalCount, items } = data.body;

          if (totalCount > 0) {
            this.repositoryList = items;
            this.currentPage = page;
          } else {
            this.repositoryList = [];
            this.error = 'Not found. Please try again or use a different name is the search input above.';
          }
        },
        (err: HttpErrorResponse) => {
          this.submitted = true;
          this.error = err.statusText;
        }      
      ); 
    }
  }
}
