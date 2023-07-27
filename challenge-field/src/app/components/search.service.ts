import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  public maxRepositoriesPerPage: number = 6;

  private searchDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  searchData$: Observable<any> = this.searchDataSubject.asObservable();

  private totalCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  totalCount$: Observable<number> = this.totalCountSubject.asObservable();

  private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private pageCache: { [key: number]: any } = {};

  constructor(private http: HttpClient) { }

  search(repoName: string, page: number): void {
    this.loadingSubject.next(true);
    this.clearCache();

    const searchUrl = `https://api.github.com/search/repositories?q=${repoName}&per_page=${this.maxRepositoriesPerPage}&page=${page}`;
    const token = environment.githubApiToken;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get(searchUrl)
      .pipe(
        catchError((error: any) => {
          console.error('Ocorreu um erro na requisição:', error);
          return throwError('Falha na requisição. Tente novamente mais tarde.');
        }),
        finalize(() => {
          this.loadingSubject.next(false);
        })
      )
      .subscribe((data: any) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          this.pageCache[page] = {
            items: data,
            total_count: data.total_count,
          };
          this.searchDataSubject.next(data);
          this.totalCountSubject.next(data.total_count);
        } else {
          this.searchDataSubject.next(null);
          this.totalCountSubject.next(0);
          alert('Repositório não encontrado');
        }
      });
  }

  getTotalCount(): number {
    return this.totalCountSubject.getValue();
  }

  private clearCache(): void {
    this.pageCache = {};
  }
}
