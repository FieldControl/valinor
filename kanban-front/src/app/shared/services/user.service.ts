import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, forkJoin, map, of, retry, tap } from "rxjs";
import { ILogin, IRegister, IUser } from "../../core/models/user";
import { Router } from "@angular/router";
import { TokenService } from "./token.service";

@Injectable({
    providedIn: 'root',
})

export class UserService extends DefaultService {
    constructor(private http: HttpClient, private router: Router, private tokenService: TokenService) {
        super('users');
    }

    private loggedIn = new BehaviorSubject<boolean>(false);

    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    list(): Observable<IUser[]> {
        return this.http.get<IUser[]>(this.url)
    }

    findById(id: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.url}/${id}`)
    }

    findEmailsByIds(ids: string[]): Observable<string[]> {
        return forkJoin(ids.map(id => this.findById(id).pipe(map(user => user.email))));
    }

    create(user: IRegister): Observable<IUser> {
        return this.http.post<IUser>(this.url, user)
    }

    edit(user: IUser): Observable<IUser> {
        return this.http.put<IUser>(`${this.url}/${user._id}`, user)
    }

    delete(id: String): Observable<IUser> {
        return this.http.delete<IUser>(`${this.url}/${id}`)
    }

    login(user: ILogin): Observable<any> {
        if (user.email !== '' && user.password !== '' ) {
            this.loggedIn.next(true);
            return this.http.post(`${this.url}/login`, user).pipe(
              tap((response: any) => {
                console.log(JSON.stringify(response))
                localStorage.setItem('acess_token', response.acess_token)
                console.log(localStorage.getItem('acess_token'))
                this.router.navigate(['/boards'])})
            )
          } else {
            return of(null);
          }
    }

    logout() {
        this.loggedIn.next(false);
        this.router.navigate(['/']);
    }
}
