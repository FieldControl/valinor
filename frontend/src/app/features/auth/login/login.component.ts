import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ILoginResponseDto, LoginDto } from "../../../shared/DTO/auth.dto";
import { AuthService } from "../../../shared/services/auth.service";


@Component({
    selector: "app-login",
    imports: [ReactiveFormsModule],
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"]
})

export class LoginComponent {
    private readonly authService = inject(AuthService)
    private readonly router = inject(Router)

    protected title = "Login";
    loginForm = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
        password: new FormControl("", [Validators.required, Validators.minLength(6)])
    })

    login() {
        if (this.loginForm.invalid) return;

        this.authService.login(this.loginForm.value as LoginDto)
            .subscribe((response) => {
                const loginResponse = response as ILoginResponseDto;
                this.authService.token = loginResponse.data.token;
                this.router.navigate(['/boards']);
            });
    }
}