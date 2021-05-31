import {Component, OnInit} from '@angular/core';
import {PaginatorService} from "./paginator.service";
import {ignoreElements} from "rxjs/operators";
import {workspaceSchemaPath} from "@angular/cli/utilities/config";

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnInit {


  paginas:number= 0
  paginaAtual:number= 1
  lista: any[] = []
  op2:number=2
  op3:number=3
  op4:number=4
  op5:number=5
  op6:number=6
  inicio:number=1
  fim:number=100
  tipo:boolean=true;
  pontinhos1:boolean=true;
  pontinhos2:boolean=false;

  constructor(public paginatorService: PaginatorService) { }

  ngOnInit(): void {
    //recebendo numero de paginas
    this.paginatorService.homeService.emissorEvento.subscribe((dados)=>{
        //divisão total de repositórios encontrados por resultados
        //dividos por 30 arredondando para cima = a numero de páginas
        this.paginas=Math.ceil(dados/30) ;
        this.construPaginator()
    })
  }

  construPaginator(){
    if (this.paginas != 0)
      if(this.paginas < 10 ) {
        let pag=1
        this.lista=[]
        this.tipo=false
        while (pag <= this.paginas){
          this.lista.push(pag)
          pag++;
        }
        console.log(this.lista)
              }else {
        if (this.paginas<100){
          this.fim=this.paginas;
        }
        this.tipo=true
        this.op2=2
        this.op3=3
        this.op4=4
        this.op5=5
        this.op6=6
      }
    }

    //emite os eventos quantos troca de pagina
    emiteeventoPesquisa(pagina:number){
      this.paginatorService.homeService.recebepagina.emit(pagina)
}

  // previous e next do paginator de 100 paginas
  proxAnterior(escolha:number){
    if (escolha == -1 && this.paginaAtual != 1){
      this.paginaAtual--;
    }
    if (escolha == 1 && this.paginaAtual != this.fim ){
      this.paginaAtual++;
    }
    this.somaSubtraiPaginas(this.paginaAtual)

  }

  // função para paginator de 100 paginas
  // contrução de paginas indefinidas de 10 a no máximo 100
  somaSubtraiPaginas(escolha:number){

    this.emiteeventoPesquisa(escolha)
    this.paginaAtual=escolha
    if(escolha<=4){
      this.pontinhos1=true
      this.pontinhos2=false
      this.op2=2
      this.op3=3
      this.op4=4
      this.op5=5
      this.op6=6

    } else if(escolha >= this.fim-4) {
      this.pontinhos2=true
      this.pontinhos1=false
      this.op2=this.fim-5
      this.op3=this.fim-4
      this.op4=this.fim-3
      this.op5=this.fim-2
      this.op6=this.fim-1
    }
    else {
      this.pontinhos1=false
      this.pontinhos2=false
      this.op2= escolha -2
      this.op3= escolha -1
      this.op4= escolha
      this.op5= escolha +1
      this.op6= escolha +2
    }
  }


  // escolha simples para paginator de 10 paginas
  trocapagina(escolha: number){
    if (escolha != this.paginaAtual) {
      this.paginaAtual = escolha
      this.emiteeventoPesquisa(escolha)
    }
  }

  // next e prex do paginator de 10 paginas
  nexPrev(escolha:number) {

      if (escolha == 1 && this.paginaAtual == this.paginas) {
        this.paginaAtual = this.paginas
      } else if (escolha == -1 && this.paginaAtual == 1) {
        this.paginaAtual = 1
      } else {
        this.paginaAtual = this.paginaAtual + escolha
      }
      this.emiteeventoPesquisa(this.paginaAtual)
    }

}

