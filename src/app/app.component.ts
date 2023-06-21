import { Component, Input, Output } from '@angular/core';
import { RepositoriosService } from './services/repositorios.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  nome_repositorio: string = ''
  repositorios: any = {}
  mensagem_erro: string = ''
  pagina: number = 0

  constructor(private repositorioservice: RepositoriosService) {} 

  mudar_nome_repositorio(nome_repositorio: string, pagina: number): void{
    this.nome_repositorio = nome_repositorio
    this.repositorioservice.pegar_repositorios(this.nome_repositorio, this.pagina).subscribe((resultado) =>{
      if(typeof resultado === 'string'){
        this.mensagem_erro = resultado; 
        this.repositorios = []
      }else{
        if(resultado.total_count === 0){
          this.mensagem_erro = 'Não achamos esse repositório'
          this.repositorios = {}
        }else{
          this.repositorios = resultado
          }
        }
      })
  }

  title = 'valinor';
}
