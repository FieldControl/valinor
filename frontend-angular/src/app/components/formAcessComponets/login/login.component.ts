import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticateService } from '../../../shared/services/users/authenticate.service';
import { AppComponent } from '../../../app.component';
import { UserService } from '../../../shared/services/users/users.service';
import { isLongin, isLonginAuth } from '../../../shared/interfaces/user.interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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


  userName(){
    const email = this.userLogin.email
    return email;
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

