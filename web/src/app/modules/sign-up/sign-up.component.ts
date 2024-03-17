import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { createUserRequest } from 'src/app/models/interface/user/signUp/request/createUserRequest';
import { UserService } from 'src/app/service/user/user.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent {
  private destroy$ = new Subject<void>();
  public isError: boolean = false;
  public textError!: string;
  public isLoading: boolean = false;

  createUserForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {}

  onSubmitcreateUserForm(): void {
    if (this.createUserForm.value && this.createUserForm.valid) {
      this.isLoading = true;

      this.userService
        .create(this.createUserForm.value as createUserRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response) {
              this.isError = false;
              this.isLoading = false;
              this.router.navigate(['/']);
            }
          },
          error: (error) => {
            this.isLoading = false;
            if (error.message === 'E-mail already registered.') {
              this.textError = 'Email já cadastrado !';
              this.isError = true;
            } else {
              this.textError = 'Desculpe, tente novamente !';
            }

            this.isError = true;
            this.isLoading = false;
          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
