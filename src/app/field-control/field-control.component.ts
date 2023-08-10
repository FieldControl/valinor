import { Component, OnInit } from '@angular/core';
import { GithubRepositoryService } from '../github-repository.service';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';

interface Repository {
  name: string;
  description: string;
  html_url: string;
}

@Component({
  selector: 'app-field-control',
  templateUrl:'./field-control.component.html',
  styleUrls: ['./field-control.component.css']
})

export class FieldControlComponent implements OnInit {

  repositories: Repository[] = [];
  pagedRepositories: Repository[] = [];
  query: string = 'test';
  currentPage: number = 0;
  itemsPerPage: number = 5;
  pageSizeOptions: number[] = [5, 25, 50];
  totalItems: number = 0;
  paginationId: string = 'pagination';
  form:FormGroup

  constructor(private githubRepoService: GithubRepositoryService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      query : ['']
    })
   }

  ngOnInit(): void {
    this.searchRepositories();
  }

  async searchRepositories() {
    if (this.query.trim() === '') {
      this.repositories = []
      this.totalItems = 0
      this.updatePagedRepositories()
      return;
    }

    try {
      const pageIndex = this.currentPage + 1;
      this.githubRepoService.pesquisarRepositorios(this.itemsPerPage, pageIndex, this.query).subscribe(data =>{
        console.log(data)
        this.repositories = data.items;
        this.totalItems = data.total_count;
        this.updatePagedRepositories();
      })


    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  }

  updatePagedRepositories() {
    const startIndex = this.currentPage * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.totalItems);
    this.pagedRepositories = this.repositories.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.itemsPerPage = event.pageSize;
    this.searchRepositories();
  }
}
