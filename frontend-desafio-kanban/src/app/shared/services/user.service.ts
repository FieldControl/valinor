import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ILogin, ILoginResponse, IRegister } from "../models/user.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class UserService {
    http = inject(HttpClient);

    login(login: ILogin): Observable<ILoginResponse> {
        return this.http.post<ILoginResponse>('/api/auth/login', login);
    }

    register(register: IRegister): Observable<ILoginResponse> {
        return this.http.post<ILoginResponse>('/api/auth/register', register);
    }
}