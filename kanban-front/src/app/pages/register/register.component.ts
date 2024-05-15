import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { IRegister } from '../../models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private userService = inject(UserService)
  private formBuilder = inject(FormBuilder)
  private router = inject(Router);

  registerForm = this.formBuilder.group({
    name: this.formBuilder.control('', Validators.required),
    email: this.formBuilder.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.control('', Validators.required)
  })

  registerFailed = false

  register() {
    if (this.registerForm.invalid) {
      this.registerFailed = true
      return
    }

    const formData = this.registerForm.value
    if (formData.name && formData.email && formData.password){
    const newUser: IRegister = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    }

    this.userService.create(newUser).subscribe({next: (response) => {
      console.log('Sucesso', response)
      this.router.navigateByUrl('/login')
    }})
  }
  }
}
