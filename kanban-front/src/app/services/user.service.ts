import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of, retry, tap } from "rxjs";
import { ILogin, IRegister, IUser } from "../models/user";
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root',
})

export class UserService extends DefaultService {
    constructor(private http: HttpClient, private router: Router) {
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
              tap(() => this.router.navigate(['/boards']))
            );
          } else {
            return of(null);
          }
    }

    logout() {
        this.loggedIn.next(false);
        this.router.navigate(['/']);
    }
}
