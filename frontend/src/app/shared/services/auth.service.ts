import { inject, Injectable, signal, WritableSignal } from "@angular/core";
import { LoginDto, RegisterDto } from "../DTO/auth.dto";
import { HttpClient } from "@angular/common/http";
import { jwtDecode } from "jwt-decode";

@Injectable({
    providedIn: "root"
})

export class AuthService {
    private _token = signal<string | undefined>(undefined);
    http = inject(HttpClient);

    constructor() {
        const token = localStorage.getItem('token');
        if (token) {
            this._token.set(token);
        }
    }

    set token(_token: string | undefined) {
        this._token.set(_token);
        localStorage.setItem('token', _token || '');
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