import { Component } from '@angular/core';
import { BgComponent } from "../bg/bg.component";
import { CardComponent } from "../card/card.component";
import { InputNameComponent } from "../input-name/input-name.component";
import { InputEmailComponent } from "../input-email/input-email.component";
import { InputPasswordComponent } from "../input-password/input-password.component";
import { BtnComponent } from "../btn/btn.component";
import { UserModule } from '../../modules/user/user.module';

@Component({
  selector: 'app-register',
  imports: [BgComponent, CardComponent, InputNameComponent, InputEmailComponent, InputPasswordComponent, BtnComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  

  async registerSubmit(e: Event) {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    const newName = formData.get('name');
    const newEmail = formData.get('email');
    const newPassword = formData.get('password');
    const confirmar = formData.get('confirmar');
    
    if(newPassword === confirmar){
      try {
        return await fetch('http://localhost:3333/user', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newName,
            email: newEmail,
            password: newPassword,
          })
        })
          .then(response => console.log(response.json()))
          .then(data => console.log(data))
          .then(()=>this.toggleShowThis())
          //before
          .then(()=>alert('Usuario creado con exito'))
      } catch (error) {
        console.log(error);
      }
    } else {
      //before
      alert('Passwords do not match');
    }
  }
  showthis: boolean = false
  toggleShowThis() {
    this.showthis = !this.showthis
  }
}
