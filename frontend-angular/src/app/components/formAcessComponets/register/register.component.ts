import { Component} from '@angular/core';

import { AuthenticateService } from '../../../shared/services/users/authenticate.service';
import { Router } from '@angular/router';
import { AccessComponent } from '../access/access.component';
import { UserService } from '../../../shared/services/users/users.service';
import { isLonginAuth, isRegister } from '../../../shared/interfaces/user.interfaces';


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
    private readonly accessComponent:AccessComponent,
  ){}

  userRegister: isRegister = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
  }



  register(){
    console.log(this.userRegister)
    this.router.navigate(['**'])

    if(!this.userRegister){
      return console.log('usuario invalido');
    }

    
    this.userService.register(this.userRegister)
    .subscribe({
      next: (token: isLonginAuth) => {
        this.authService.token = token.accessToken;
        this.router.navigate(['boardsList'])
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        console.log()
      },
    })

    
  }
}
