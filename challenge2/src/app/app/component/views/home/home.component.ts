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
  primeira:number = 1;
  segunda:number = 2;
  terceira:number = 3;
  quarta:number = 4;
  quinta:number = 5;
  pgAtual:number=1;
  previous:boolean=true;

  constructor( private formBuilder: FormBuilder, public home: HomeService) { }
  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      pesquisa: ['Node Js', Validators.required],
    });
    this.pesquisa(this.pgAtual)

  }

  pesquisa(pagina: number){
    console.log(pagina)
    this.home.consulta(this.formulario.get('pesquisa')?.value, pagina).subscribe((dados)=>{
      this.mostrarPesquisa(dados)

    })
  }

  mostrarPesquisa(values: any){
    this.resultado = values.items
    console.log(this.resultado)
  }

  pginacao(numero: number) {
    this.pesquisa(numero)
    this.pgAtual=numero
    if ( numero == 1 ){
      this.primeira = 1;
      this.segunda = 2;
      this.terceira = 3;
      this.quarta = 4;
      this.quinta = 5;
      this.previous=true;
    }
    if ( numero > 2 ) {
      this.primeira = numero - 2
      this.segunda = numero - 1
      this.terceira = numero
      this.quarta = numero + 1
      this.quinta = numero + 2
      this.previous=false;
      console.log(this.previous)
    }
  }}
