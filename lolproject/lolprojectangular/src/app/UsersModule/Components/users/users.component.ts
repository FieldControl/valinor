import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/AuthModule/Services/auth.service';
import { BaseComponent } from 'src/shared/Components/base-component/base-component.component';

@Component({
  selector: '../users',
  templateUrl: '../users/users.component.html',
  styleUrls: ['../users/users.component.scss'],
})
export class UsersComponent extends BaseComponent implements OnInit {
  constructor(public formBuilder?: FormBuilder, public authService?: AuthService, public router?: Router) {
    super();
    this.formCreate = this.formBuilder?.group({
      username: [''],
      password: [''],
      confirmPassword: ['']
    })
  }

  ngOnInit(){

  }
  submitAlterState(){
    if (this.stateForm == "create") {
      this.createUser();
    }
  }

  createUser() {
    const username = this.formCreate?.value.username;
    this.authService?.getUserByName(username).subscribe(
      existingUser => {
        if (existingUser.length > 0) {

          alert("USUÁRIO " + username + "JÁ CADASTRADO" );
        } else {
          if(this.formCreate?.value.password == this.formCreate?.value.confirmPassword) {
            this.authService?.createUser(this.formCreate?.value).subscribe(
              newUser => {
                alert("USUÁRIO " + username.toUpperCase() + " CADASTRADO !");
                document.location.reload();
              },
              err => {
                console.log(err);
                alert("NÃO FOI POSSÍVEL CADASTRAR O USUÁRIO " + username.toUpperCase() + " !");
              }
            );
          }
          else {
            alert("SENHAS NÃO CORRESPONDEM")
          }

        }
      },
      err => {
        console.log(err);
      }
    );
  }
}
