import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IssuesService {
  query: string='';
  issues: any = {items:[]};
  currentPage: number = 1;
  pageSize: number = 30;
  constructor(private http: HttpClient) { }

  searchIssues(page: number, perPage: number) {
    const apiUrl = `https://api.github.com/search/issues?q=${this.query}&page=${page}&per_page=${perPage}`;
    return this.http.get(apiUrl).subscribe((data) => {
      this.issues = data;
    });
  }
}
