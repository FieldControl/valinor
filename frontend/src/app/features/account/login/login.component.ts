import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { IRegister, ILoginReponse, ILogin } from '../../../shared/services/models/user.model';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  fb = inject(NonNullableFormBuilder);
  loginForm = this.fb.group({
    email:this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', [Validators.required, Validators.minLength(8)]),
  });

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.userService
      .login(this.loginForm.value as ILogin)
      .subscribe((token: ILoginReponse)=>{
          this.authService.token = token.accessToken;
          console.log('loggado!');
          this.router.navigateByUrl('/quadros');
        });  
      }

}
