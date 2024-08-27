import { Component } from '@angular/core';
import { UserService } from '../../../services/users.service';
import { isLongin, isLonginAuth } from '../../../interfaces/user.interfaces';
import { Router } from '@angular/router';
import { AuthenticateService } from '../../../services/authenticate.service';

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
  ){}

  userLogin: isLongin = {
    email: '',
    password:'',
  }


  login(){
    console.log(this.userLogin)

    if(!this.userLogin){
      return console.log('usuario invalido');
    }

    this.userService.login(this.userLogin)
    .subscribe({
      next: (token: isLonginAuth) => {
        this.authService.token = token.accessToken;
        console.log('User Registred')
        this.router.navigate(['home'])
        console.log('não trocou a pagina')
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
      },
    })

    
  }
}
