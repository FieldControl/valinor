import { UserService } from './../../../shared/services/user.service';
import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ILoginReponse, IRegister } from '../../../shared/services/models/user.model';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, MatButtonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  fb = inject(NonNullableFormBuilder);
  registerForm = this.fb.group({
    email:this.fb.control('', [Validators.required, Validators.email]),
    senha: this.fb.control('', [Validators.required, Validators.minLength(8)]),
    primeiroNome: this.fb.control('', [Validators.required]),
    ultimoNome: this.fb.control('', [Validators.required]),

  });

  register() {
    if (this.registerForm.invalid) {
      return;
    }

    this.userService
      .register(this.registerForm.value as IRegister)
      .subscribe((token: ILoginReponse)=>{
          this.authService.token = token.accessToken;
          console.log('usuario registrado');
          this.router.navigateByUrl('/quadros');
        });  
      }

}
