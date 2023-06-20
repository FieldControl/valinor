import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-component',
  templateUrl: './search-component.component.html',
  styleUrls: ['./search-component.component.css']
})
export class SearchComponentComponent {
  @Output() mudar_nome_repositorio: EventEmitter<string> = new EventEmitter()
  nome_repositorio: string = ''

  enviar_nome_repositorio(): void{
    if(this.nome_repositorio !== ''){
      this.mudar_nome_repositorio.emit(this.nome_repositorio)
    }
  }
}
