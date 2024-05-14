import { HttpClient } from "@angular/common/http";
import { DefaultService } from "./default.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { jwtDecode } from "jwt-decode";

@Injectable({
    providedIn: 'root',
})

export class TokenService extends DefaultService { 
    constructor(private http: HttpClient) {
        super('token');
    }

    private refreshTokenInterval: any;

    decodeToken(): any {
        const token = localStorage.getItem('acess_token')
        if (!token) return null

        return jwtDecode(token)
    }

    refreshToken(oldToken: string): Observable<any> {
        return this.http.put(`${this.url}/refresh`, { oldToken });
      }
    
    startRefreshTokenTimer() {
    // tempo de expiração do token
    const expiresIn = 10 * 1000;
    
    // atualiza o token antes de expirar
    this.refreshTokenInterval = setInterval(() => {
        const token = localStorage.getItem('acess_token');
        if (token) {
            this.refreshToken(token).subscribe();
            console.log('refrescadoooooo',token)
        }
    }, expiresIn);
    }
      
}