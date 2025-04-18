import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GraphQLClient, gql } from 'graphql-request';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog-register',
  templateUrl: './dialog-register.component.html',
  styleUrl: './dialog-register.component.scss',
  imports:[
    CommonModule,
    FormsModule,          
    MatDialogModule
  ],
})
export class DialogRegisterComponent {

  private graphQLClient: GraphQLClient;

  constructor(private _dialogRef: MatDialogRef<DialogRegisterComponent>) {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
    this.graphQLClient = new GraphQLClient(apiUrl);
  }

  async register(form: NgForm) {
    if (form.invalid) {
      console.error('Formulário inválido');
      alert("É necessario aceitar os termos e condições")
      return;
    }

    const { name, email, password, confirmPassword, terms } = form.value;

    if (password !== confirmPassword) {
      console.error('As senhas não coincidem.');
      return;
    }

    if (!terms) {
      console.error('Você precisa aceitar os termos.');
      return;
    }

    const mutation = gql`
      mutation CreateUser($email: String!, $name: String!, $password: String!) {
        createUser(createUserInput: { email: $email, name: $name, password: $password }) {
          _id
          email
          name
        }
      }
    `;

    try {
      const response = await this.graphQLClient.request(mutation, { email, name, password });
      alert('Usuário criado com sucesso');
      this.close();
      return response;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return;
    }
  }
  close() {
    this._dialogRef.close();
  }
}
