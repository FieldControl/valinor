import { Injectable } from '@angular/core';

@Injectable()
export class NavbarService {

  visible: boolean;
  nome: string;
  imagem: string;

  constructor() { 

  	let token = localStorage.getItem('token');
  	// console.log(token); 

  	if (token) {
  		this.visible = true; 
  	}
  	else{
  		this.visible = false; 
  	} 	


  	let nome = localStorage.getItem('nome');
  	// console.log(token); 

  	if (nome) {
  		this.nome = nome; 
  	}
 

    let imagem = localStorage.getItem('imagem');
    // console.log(token); 

    if (imagem) {
      this.imagem = imagem; 
    }
    else{
      this.imagem = 'https://www.funcamp.unicamp.br/portal/Imagens/user.png';
    }

  }

  hide() { this.visible = false; }

  show() { this.visible = true; }

  toggle() { this.visible = !this.visible; }

  atualizarNome() { 

  	this.nome = localStorage.getItem('nome'); 

    let imagem = localStorage.getItem('imagem');
    // console.log(token); 

    if (imagem) {
      this.imagem = imagem; 
    }
    else{
      this.imagem =  'https://www.funcamp.unicamp.br/portal/Imagens/user.png';
    }

  }
 
}