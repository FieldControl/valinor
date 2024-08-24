import { Component } from '@angular/core';
import { UserService } from '../../../services/users.service';
import { isLongin } from '../../../interfaces/user.interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private userService : UserService){}

  userLogin: isLongin = {
    email: '',
    password:'',
  }

  enter(){
    return this.userService.login(this.userLogin);
  }
}
