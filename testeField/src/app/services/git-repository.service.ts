import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { gitRepositoryModel } from '../Interfaces/gitRepository.interface';

@Injectable({
  providedIn: 'root'
})
export class GitRepositoryService {

  constructor(private http: HttpClient) { }

  listarRepos(parameter: string) : Observable<{items: gitRepositoryModel[]}> {
    console.log(parameter)
    return this.http.get<{items: gitRepositoryModel[]}>('https://api.github.com/search/repositories?q='.concat(parameter))
  }
}
