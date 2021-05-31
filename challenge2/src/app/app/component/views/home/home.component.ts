import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {HomeService} from "./home.service";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


  formulario!: FormGroup;
  resultado: any;
  pgAtual:number=1;


  constructor( private formBuilder: FormBuilder, public homeService: HomeService) { }
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      pesquisa: ['Node Js', Validators.required],
    });
    this.pesquisa(this.pgAtual)
    //recebendo a pagina escolhida pelo usuário e enviado para o metodo de pesquisa
    this.homeService.recebepagina.subscribe((paginaEscolhida)=>{
      this.pesquisaSemEvento(paginaEscolhida)
    })

  }
  // método que faz a pesquisa no service
  pesquisa(pagina: number){
    // subscribe no observable
    this.homeService.consulta(this.formulario.get('pesquisa')?.value,pagina).subscribe((dados)=>{
      this.resultado = dados.items
      let paginas = Math.ceil(dados.total_count)
      this.homeService.emissorEvento.emit(paginas)
    })
  }

  // pesquisa recebendo a nova pagina sem gerar um evento
  // quando muda de pagina nao gera evento para o paginator
  pesquisaSemEvento(pagina: number){
    this.homeService.consulta(this.formulario.get('pesquisa')?.value,pagina).subscribe((dados)=>{
      this.resultado = dados.items
    })
  }

}
