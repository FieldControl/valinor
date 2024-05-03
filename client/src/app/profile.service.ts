import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private apiUrl = 'http://localhost:3000/api/users';
    user: any = { name: 'Default', email: 'default@teste.com', password: ''};

    constructor(private http: HttpClient) { }

    changePassword(password: string): Observable<any> {
        this.user.password = password;
        return this.updatedUser(this.user);
    }

    updatedUser(user: any): Observable<any> {
        this.user = user;
        return of(this.user);
    }
}
