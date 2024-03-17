import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subject, takeUntil } from 'rxjs';
import { AuthRequest } from 'src/app/models/interface/user/auth/request/AuthRequest';
import { UserService } from '../../service/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public isError: boolean = false;
  public textError!: string;
  public isLoading: boolean = false;

  loginForm = this.formBuilder.group({
    email: ['', Validators.required, ''],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private cookieService: CookieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/kanban']);
    }
  }

  onSubmitLoginForm(): void {
    if (this.loginForm.value && this.loginForm.valid) {
      this.isLoading = true;

      this.userService
        .auth(this.loginForm.value as AuthRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.cookieService.set('token', response.token);
              this.router.navigate(['/kanban']);
              this.isError = false;
              this.isLoading = false;
            }
          },
          error: (error) => {
            if (error.message) {
              this.textError = 'Credenciais inválidas!';
              this.isError = true;
              this.isLoading = false;
            }
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
