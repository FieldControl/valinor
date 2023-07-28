import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SignInCommand } from '@core/interfaces';
import { tap } from 'rxjs';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  signInForm = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  submit() {
    if (this.signInForm.invalid) return;

    this.authService.signIn(this.signInForm.value as SignInCommand);
    this.router.navigate(['/']);

    // this.authService
    //   .signIn(this.signInForm.value as SignInCommand)
    //   .pipe(
    //     tap(
    //       res => {
    //         if (res) this.router.navigate(['/']);
    //       },
    //       err => {
    //         this.snackbar.open('SignIn Failed', 'close', {
    //           duration: 3000,
    //           horizontalPosition: 'center',
    //           verticalPosition: 'top',
    //         });
    //       }
    //     )
    //   )
    //   .subscribe();
  }

  getEmailError() {
    return 'Not a valid email';
  }

  getPasswordError() {
    if (this.signInForm.get('password')?.hasError('required'))
      return 'You must enter a value';
    return '';
  }
}
