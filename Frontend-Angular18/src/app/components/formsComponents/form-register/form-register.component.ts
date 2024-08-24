import { Component } from '@angular/core';

@Component({
  selector: 'app-form-register',
  templateUrl: './form-register.component.html',
  styleUrl: './form-register.component.css'
})
export class FormRegisterComponent {


  registerNewUser(){
    alert('Seu usuario foi cadastrado')
  }

}
