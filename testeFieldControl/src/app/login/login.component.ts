import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import {Router} from '@angular/router';
import { NavbarService } from '../navbar.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

 email: string;
 senha: string;

 carregando = false;

 loginForm: FormGroup;

  constructor( private http: HttpClient, private fb: FormBuilder, private router: Router, public nav: NavbarService) {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: [''],
      senha: ['']
    });
  }
 
onClickSubmit(usuario) {

  if (usuario.email) {

    if (usuario.senha) {

      this.carregando = true;

       usuario['ip'] = '192.168.0.1';
       usuario['tipo'] = 'site';

      this.http.post<any>('https://filmaxbox.com/api/usuarios/login', usuario).subscribe(data => {

          // console.log(data);

          if (data.status != 'erro') {

            localStorage.setItem('token', data.usuario.token);
            localStorage.setItem('nome', data.usuario.nome); 
            localStorage.setItem('imagem', data.usuario.imagem); 

            this.nav.show(); 

            this.nav.atualizarNome();

            this.router.navigateByUrl('/movies');
            
          }
          else{

            this.carregando = false;

            Swal.fire({
              title: 'Atenção!',
              text: 'Usuário não encontrado, verifique seus dados e tente novamente.',
              icon: 'error',
              confirmButtonText: 'OK'
            });

          }
      },
      error => {

        this.carregando = false;

          if(error.status == 400) {

            Swal.fire({
              title: 'Atenção!',
              text: 'Usuário não encontrado, verifique seus dados e tente novamente.',
              icon: 'error',
              confirmButtonText: 'OK'
            });

            // console.log(error);

          }

      });
      
    }
    else{

      Swal.fire({
        title: 'Atenção!',
        text: 'Informe a senha para continuar',
        icon: 'error',
        confirmButtonText: 'OK'
      });

    }
    
  }
  else{

    Swal.fire({
      title: 'Atenção!',
      text: 'Informe o e-mail para continuar',
      icon: 'error',
      confirmButtonText: 'OK'
    });

  }

}

  ngOnInit() {

     let token = localStorage.getItem('token');
    // console.log(token); 

    if (token) {
      this.router.navigateByUrl('/movies');      
    }

  }

}

