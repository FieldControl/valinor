import { Injectable } from "@angular/core";
import { DefaultService } from "./default.service";
import { HttpClient } from "@angular/common/http";
import { Observable, retry } from "rxjs";
import { IUser } from "../models/user";

@Injectable({
    providedIn: 'root',
})

export class UserService extends DefaultService {
    constructor(private http: HttpClient) {
        super('users');
    }

    list(): Observable<IUser[]> {
        return this.http.get<IUser[]>(this.url)
    }

    findById(id: string): Observable<IUser> {
        return this.http.get<IUser>(`${this.url}/${id}`)
    }

    create(user: IUser): Observable<IUser> {
        return this.http.post<IUser>(this.url, user)
    }

    edit(user: IUser): Observable<IUser> {
        return this.http.put<IUser>(`${this.url}/${user._id}`, user)
    }

    delete(id: String): Observable<IUser> {
        return this.http.delete<IUser>(`${this.url}/${id}`)
    }
}
