import { Component } from '@angular/core';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrl: './access.component.css'
})
export class AccessComponent {
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
