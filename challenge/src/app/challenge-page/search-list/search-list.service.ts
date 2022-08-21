import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchListService {

  private apiUrl: String = 'https://api.github.com/search/repositories'

  constructor(private httpClient: HttpClient) { }

  getApiData(searchLine: string): any{
    fetch(this.apiUrl + "?q=" + searchLine)
    .then(async (res:any) => {
      
      if(!res.ok){
        throw new Error(res.status)
      }

      var data = await res.json()

      console.log(data)
      return data

    }).catch(e => console.log(e))
  }

}
