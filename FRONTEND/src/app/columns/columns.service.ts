import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Column } from './columns.model';


@Injectable({
  providedIn: 'root'
})
export class ColumnsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getColumns(title: string = '')  {
    let url = `${this.apiUrl}/columns`;
    if (title) {
      url += `?title=${title}`;
    }
    
    return this.http.get<Column[]>(url)
  }


}
