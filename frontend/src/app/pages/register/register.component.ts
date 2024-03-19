import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  imports: [MatGridListModule, MatIconModule, ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RegisterComponent {
  registerForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false, []],
  });
  showRegisterError = false;
  isSubmitting = false;
  cacheInfoData = '@field-control/data';

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    private router: Router,
    cookieService: CookieService
  ) {
    this.registerForm.valueChanges.subscribe(() => {
      this.showRegisterError = false;
    });

    if (cookieService.check('token')) {
      this.router.navigate(['/projects']);
    }
  }

  onLogin() {
    return this.router.navigate(['/login']);
  }

  onSubmit() {
    if (!this.registerForm.valid) return;
    this.isSubmitting = true;
    const { ...rest } = this.registerForm.value;

    this.api.register(rest).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.isSubmitting = false;
        this.showRegisterError = true;
      },
    });
  }
}
