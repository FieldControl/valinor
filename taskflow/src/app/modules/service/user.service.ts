import { Injectable } from '@angular/core';
import { GraphQLClient, gql } from 'graphql-request';

//interfaces
import { LoginResponse } from '../interface/login-response.interface';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';



@Injectable({
  providedIn: 'root'
})

export class UserService {
  private router = new Router
  private authService = new AuthService
  private graphQlClient: GraphQLClient;

  constructor( ) {
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
    this.graphQlClient = new GraphQLClient(apiUrl);
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
      this.authService.setUser(response);
      this.router.navigate(['/workspace'])
    }catch(error){
      console.error("Erro ao logar: ", error)
    }
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
      const response = await this.graphQlClient.request(mutation, { email, name, password });
      
      alert('Usuário criado com sucesso');
      
      return response;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert("Esse email pode já existir")
      return;
    }
  }

}