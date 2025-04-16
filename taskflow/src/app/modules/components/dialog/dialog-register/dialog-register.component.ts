import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GraphQLClient, gql } from 'graphql-request';
import { GoogleBtnComponent } from "../../google-btn/google-btn.component";

@Component({
  selector: 'app-dialog-register',
  templateUrl: './dialog-register.component.html',
  styleUrl: './dialog-register.component.scss',
  imports: [GoogleBtnComponent]
})
export class DialogRegisterComponent {
  private graphQLClient: GraphQLClient;

  constructor(private _dialogRef: MatDialogRef<DialogRegisterComponent>) {
    
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
    this.graphQLClient = new GraphQLClient(apiUrl);
  }

  public close(): void {
    this._dialogRef.close();
  }

  public async register(form: HTMLFormElement): Promise< unknown | void> {
    console.log('1')
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const confirmPW = formData.get('confirm-password') as string;

    const mutation = await gql`
      mutation CreateUser($email: String!, $name: String!, $password: String!) {
        createUser(createUserInput: { email: $email, name: $name, password: $password }) {
          _id
          email
          name
        }
      }
    `;

    if (password !== confirmPW) {
      console.error('As senhas não coincidem.');
      return;
    } else {
      try {
        const response = await this.graphQLClient.request(mutation, { email, name, password });
        alert('Usuário criado com sucesso');
        this.close();
        return response;
      } catch (error) {
        console.error('Erro ao criar usuário:', error);
      }
    }

    console.log('4');
    return;
  }
  clickGoogle(){

  }
}