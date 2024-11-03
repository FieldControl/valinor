import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, MatCard, MatInput, MatButton, MatCardContent, MatCardHeader, MatLabel, MatCardTitle, MatCardActions, MatFormField, FormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {

  form: FormGroup = new FormGroup({});
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) { }
  loginModel = new UserModel();
  ngOnInit(): void {
    this.form = this.fb.group({
      username: [this.loginModel.username, Validators.required],
      password: [this.loginModel.password, Validators.required]
    });
  }
  submit() {
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe((data) => {
        console.log(data);
        if (data?.access_token) {
          localStorage.setItem('token', data.access_token);
          this.router.navigate(['/home']);
        }
      });
    }
  }
  navigateToRegisterPage() {
    this.router.navigate(['/register']);
  }
}
