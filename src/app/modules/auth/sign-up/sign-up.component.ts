import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent {
  signUpForm = this.fb.group({
    email: [Validators.required, Validators.email],
    name: [Validators.required],
    password: [Validators.required],
    passwordConfirmation: [Validators.required],
  });

  constructor(private fb: FormBuilder) {}
}
