import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable , forkJoin, map} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class RicktyService {

  private  apiUrl = 'https://rickandmortyapi.com/api/character/';
 

  constructor(private httpClient : HttpClient){}

  getAllCharacters(): Observable<any[]> {

    const observables:any[] = [];
    for (let i = 1; i <= 42; i++) {
      const params = { page: i };
      observables.push(this.httpClient.get(this.apiUrl, { params })); 
    }
    return forkJoin(observables).pipe(
      map(responses => responses.map(response => response.results).flat())
    );
  }
  
getCharactersDefault(url:string){
  return (this.httpClient.get<any>(url))
}

}
