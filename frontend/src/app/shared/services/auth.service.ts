import { inject, Injectable } from "@angular/core";
import { LoginDto, RegisterDto } from "../DTO/auth.dto";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root"
})

export class AuthService {
    http = inject(HttpClient);

    // Fazer login
    login(login: LoginDto) {
        return this.http.post("/api/login", login);
    }

    // Criar uma conta
    register(register: RegisterDto) {
        return this.http.post("/api/register", register);
    }
}