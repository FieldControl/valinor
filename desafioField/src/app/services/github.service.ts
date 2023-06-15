import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Make the service avaliable to use
@Injectable({providedIn: 'root'})


export class GithubService {
    constructor(private httpClient: HttpClient) { }

    // Api
    private api = "https://api.github.com/search/";
    private token = "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"
    
    // Method search repositories
    searchProjects(projectQuery:string, page: number): Observable<any> {
        const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${this.token}`)
        .set('Accept', 'application/vnd.github.v3+json');

        const url = this.api+"repositories?q="+projectQuery+"&per_page=10&page="+page;
        return this.httpClient.get<any>(url, { headers })
    }

    // Method search issues , it dont need auth becouse it not accep { headers }
    searchIssues(issueQuery:string, page:number): Observable<any> {

        const url = this.api+"issues?q=repo:"+issueQuery+"&per_page=10&page="+page;
        return this.httpClient.get<any>(url)
    }

}
