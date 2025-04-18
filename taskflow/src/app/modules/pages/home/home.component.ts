import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { DialogRegisterComponent } from '../../components/dialog/dialog-register/dialog-register.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { gql, GraphQLClient } from 'graphql-request';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginResponse } from '../../interface/login-response.interface';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, MatDialogModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private graphQlClient: GraphQLClient;
  constructor(private router : Router, private authService: AuthService ) {
    const apiUrl =
      (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
    this.graphQlClient = new GraphQLClient(apiUrl);
  }
  #dialog = inject(MatDialog);
  public openDialog() {
    this.#dialog.open(DialogRegisterComponent);
  }
  async login(form: NgForm) {
    if (form.invalid) {
      console.error('Formulário inválido');
      alert('É necessário preencher todos os campos');
      return;
    }
    const { email, password } = form.value;

    const mutation = gql`
      mutation Login ($email: String!, $password: String!){
        login(email: $email, password: $password) {
            _id
            name
          }
        }
    `;
    try {
      const response: LoginResponse = await this.graphQlClient.request(mutation, {
        email,password
      });
      alert(`Bem vindo ${response.login.name.toString()}`)
      
      this.loginSucess(response)
    }catch(error){
      console.error("Erro ao logar: ", error)
    }
  }
  loginSucess(user:LoginResponse){
    this.authService.setUser(user);
    this.router.navigate(['/workspace'])
  }
}
