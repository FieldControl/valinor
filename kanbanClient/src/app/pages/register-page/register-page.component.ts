import { Component, forwardRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardActions, MatCardModule } from '@angular/material/card';
import { MatLabel, MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { UserModel } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MatCardModule,MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RegisterPageComponent),
      multi: true,
    }
  ]
})
export class RegisterPageComponent implements OnInit {
  registerModel: UserModel = new UserModel();
  form: FormGroup = new FormGroup({});
  constructor(private fb: FormBuilder, private userService: UserService) { }
  ngOnInit(): void {
    this.form = this.fb.group({
      username: [this.registerModel.username, Validators.required],
      password: [this.registerModel.password, Validators.required]
    });
  }
  submit() {
    console.log(this.form);
    if (this.form.valid) {
      this.userService.createUser(this.form.value).subscribe((data) => {
        alert('registered successfully');
      });
    }
  }

}
