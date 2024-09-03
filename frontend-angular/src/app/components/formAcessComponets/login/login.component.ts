import { Component, input } from '@angular/core';

import { isLongin, isLonginAuth } from '../../../interfaces/user.interfaces';
import { Router } from '@angular/router';
import { AuthenticateService } from '../../../services/user/authenticate.service';
import { AppComponent } from '../../../app.component';
import { UserService } from '../../../services/user/users.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  
  constructor(
    private userService : UserService,
    private authService : AuthenticateService,
    private router : Router,
    private appComponent : AppComponent,
  ){}

  userLogin: isLongin = {
    email: '',
    password:'',
  }


  login(){

    if(!this.userLogin){
      return console.log('usuario invalido');
    }
    
    this.userService.login(this.userLogin)
    .subscribe({
      next: (token: isLonginAuth) => {
        this.authService.token = token.accessToken;
        this.router.navigate(['home'])
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
      },
    })
    
  }
}
function entrar() {
  throw new Error('Function not implemented.');
}

