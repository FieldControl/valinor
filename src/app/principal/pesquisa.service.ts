import { QueryBuilder } from './../utils/Pagination';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Pesquisa } from './Pesquisa';
import { Items } from './Items';

@Injectable({
  providedIn: 'root'
})
export class PesquisaService {

  private readonly REPOSITORIO = "https://api.github.com/search/repositories";
  public nextUrl: string | null = null;
  public prevUrl: string | null = null;
  private firstUrl: string | null = null;
  private lastUrl: string | null = null;
  public totalItems: number = 0;
  per_page = 10;
  skip = 0;
  current_page = 0;
  numOfPage = 0;
  error = '';
  items: Items[] = [];


  constructor(private http: HttpClient) { }

  pesquisar(pesquisa: string, urlPage: string | null): Observable<HttpResponse<Pesquisa>> {
    const url = urlPage == null ? `${this.REPOSITORIO}?q=${encodeURIComponent(pesquisa)}&per_page=${this.per_page}` : `${urlPage}`
    const response = this.http.get<Pesquisa>(url, { observe: 'response' });
    return response;
  }

  // Função para extrair e armazenar os links de paginação dos cabeçalhos
  private extractPaginationLinks(headers: HttpHeaders) {
    const link = headers.get('Link');
    const links = link?.split(',').map(p => p.split(';').map(s => s.trim()));

    links?.forEach(([url, rel]) => {
      const matchUrl = url.match(/<(.*)>/);
      const matchRel = rel.match(/rel="(.*)"/);
      const urlValue = matchUrl ? matchUrl[1] : null;
      const relValue = matchRel ? matchRel[1] : null;
      if (urlValue && relValue) {
        if (relValue === 'next') this.nextUrl = urlValue
        if (relValue === 'prev') this.prevUrl = urlValue;
        if (relValue === 'first') this.firstUrl = urlValue;
        if (relValue === 'last') this.lastUrl = urlValue;
      }
    });

    const retorno = {
        next: this.nextUrl,
        prev: this.prevUrl,
        first: this.firstUrl,
        last: this.lastUrl
      }

      return retorno;
    }
  processResponse(response: HttpResponse<Pesquisa>) {
return this.extractPaginationLinks(response.headers);
  }

  changePage(url: string): Observable<HttpResponse<Pesquisa>> {
    return this.http.get<Pesquisa>(url, { observe: 'response' });
  }
}
