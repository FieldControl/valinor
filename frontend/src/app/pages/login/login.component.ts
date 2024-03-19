import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [MatGridListModule, MatIconModule, ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LoginComponent {
  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });
  showLoginError = false;
  isSubmitting = false;
  cacheInfoData = '@field-control/data';

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    private cookieService: CookieService
  ) {
    this.loginForm.valueChanges.subscribe(() => {
      this.showLoginError = false;
    });
  }

  onRegister() {
    return this.router.navigate(['/register']);
  }

  onSubmit() {
    if (!this.loginForm.valid) return;
    this.isSubmitting = true;
    const { ...rest } = this.loginForm.value;

    this.api.login(rest).subscribe({
      next: (response) => {
        this.cookieService.set('token', response.token);
        this.router.navigate(['/projects']);
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.showLoginError = true;
      },
    });
  }
}
