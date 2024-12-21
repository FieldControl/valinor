import { Injectable } from '@angular/core';
import { UserModule } from "../modules/user/user.module.js";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  router = new Router()
  
  user?: UserModule;
  
  
  async login(email:string, password:string){
    console.log(email, password);
    await fetch('http://localhost:3333/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      })
    })
    .then(response => response.json())
    .then((data) =>{
      this.user = new UserModule(
        data.user.id,
        data.user.name,
        data.user.email,
        data.user.password
      )
      localStorage.setItem('user', JSON.stringify(this.user)) 
      //before
      alert('Login successful')
      this.router.navigate(['/kanban'])
    })
    .catch(error => console.error(error));
  }
  logout(){
    localStorage.removeItem('user')
    this.router.navigate(['/'])
  }
}
