import { Component } from '@angular/core';
import { RegisterUserFormComponent } from '../../components/forms/register-user-form/register-user-form.component';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RegisterUserFormComponent],
  templateUrl: './register-user.component.html',
  styleUrl: './register-user.component.scss',
})
export class RegisterUserComponent {}
