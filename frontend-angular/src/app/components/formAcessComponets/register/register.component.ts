import { Component } from '@angular/core';
import { UserService } from '../../../services/users.service';
import { isLonginAuth, isRegister } from '../../../interfaces/user.interfaces';
import { AuthenticateService } from '../../../services/authenticate.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  constructor(
    private userService : UserService,
    private authService : AuthenticateService,
    private router : Router,
  ){}

  userRegister: isRegister = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  }

  register(){

    if(!this.userRegister){
      return;
    }

    this.userService.register(this.userRegister)
    .subscribe({
      next: (token: isLonginAuth) => {
        this.authService.token = token.authtoken;
        console.log('User Registred')
        this.router.navigate(['/home'])
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        console.log('Api finalizada')
      },
    })
    
  }
}
