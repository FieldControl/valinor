import { Component } from '@angular/core';

@Component({
  selector: 'app-access-app',
  templateUrl: './access-app.component.html',
  styleUrl: './access-app.component.css'
})
export class AccessAppComponent {
  isRegister : boolean = false;
  isLogin : boolean = true;

  changeForm(){
    console.log('Meu link está ativo');
    if (this.isRegister === false){
      this.isRegister = true;
      this.isLogin = false;
    }else{
      this.isRegister = false;
      this.isLogin = true;
    }
    
  }

}
