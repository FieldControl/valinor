import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Make the service avaliable to use
@Injectable({providedIn: 'root'})


export class GithubService {
    constructor(private httpClient: HttpClient) { }
    
    // Sets the github api url
    private githubApi = 'https://api.github.com';

    // Method search repositories
    searchProjects(projectQuery:string): Observable<any> {
        const url = "${this.githubApi}/search/repositories?q=${projectQuery}";
        return this.httpClient.get<any>(url)
    }

    // Method search issues
    searchIssues(issueQuery:string): Observable<any> {
        const url = "${this.githubApi}/search/issues?q=repo:${this.issueQuery}";
        return this.httpClient.get<any>(url)
    }

}