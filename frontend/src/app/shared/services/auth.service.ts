import { inject, Injectable, signal, WritableSignal, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { LoginDto, RegisterDto } from "../DTO/auth.dto";
import { HttpClient } from "@angular/common/http";
import { jwtDecode } from "jwt-decode";

@Injectable({
    providedIn: "root"
})

export class AuthService {
    private _token = signal<string | undefined>(undefined);
    http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const token = localStorage.getItem('token');
            if (token) {
                this._token.set(token);
            }
        }
    }

    set token(_token: string | undefined) {
        this._token.set(_token);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', _token || '');
        }
    }

    get token(): WritableSignal<string | undefined> {
        return this._token;
    }

    // Fazer login
    login(login: LoginDto) {
        return this.http.post("http://localhost:3000/auth/login", login);
    }

    // Criar uma conta
    register(register: RegisterDto) {
        return this.http.post("http://localhost:3000/auth/register", register);
    }

    // Validar o JWT token do usuario
    hasValidToken(): boolean {
        const token = this._token();
        if (!token) return false;

        const decodedToken = jwtDecode(token);
        const now = Date.now() / 1000;

        if (!decodedToken.exp) return false;

        return decodedToken.exp > now;
    }
}