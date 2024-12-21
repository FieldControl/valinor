import { Component } from '@angular/core';
import { BgComponent } from '../bg/bg.component';
import { InputEmailComponent } from '../input-email/input-email.component';
import { InputPasswordComponent } from "../input-password/input-password.component";
import { BtnComponent } from '../btn/btn.component';
import { RegisterComponent } from "../register/register.component";
import { Router } from '@angular/router';
import { CardComponent } from "../card/card.component";
import { AuthService } from '../../services/auth.service';



@Component({
  selector: 'app-login',
  imports: [BgComponent, InputEmailComponent, InputPasswordComponent, BtnComponent, RegisterComponent, CardComponent],
  standalone: true,
  providers: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  auth = new AuthService()
  router = new Router()
  showthis = false
  async submitLogin(e:Event){
    e.preventDefault();
    console.log("Login form submitted");
    const formData = new FormData(e.target as HTMLFormElement);
    const email:string = String(formData.get('email'));
    const password:string = String(formData.get('password'));
    this.auth.login(email, password);
  }
  toggleShowThis(){
    this.showthis=!this.showthis
  }
}
