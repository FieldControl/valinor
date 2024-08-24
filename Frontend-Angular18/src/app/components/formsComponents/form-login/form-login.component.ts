import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { isLongin } from '../../../interfaces/users.interface';

@Component({
  selector: 'app-form-login',
  templateUrl: './form-login.component.html',
  styleUrl: './form-login.component.css'
})
export class FormLoginComponent {
  constructor(private userService : UserService){}
  
  

}
