import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-paginas-component',
  templateUrl: './paginas-component.component.html',
  styleUrls: ['./paginas-component.component.css']
})
export class PaginasComponentComponent {
  @Input() quantidade_paginas: number = 0
  @Input() pagina: number = 0
  @Output() nova_pagina: EventEmitter<number> = new EventEmitter()
  pagina_final: number = 100

  define_pagina_final(): void{
    if(this.quantidade_paginas > 990){
      this.pagina_final = 100
    }else if(this.quantidade_paginas > 10){
      this.pagina_final = Math.ceil(this.quantidade_paginas/10)      
    }else{
      this.pagina_final = 0
    }
  }
  
  cria_list_paginacao(){
    if(this.pagina === 1){
      if(this.quantidade_paginas > 30){
        return [0, 1, 2]
      }else if(this.quantidade_paginas > 20){
        return [0, 1]
      }else{
        return []
      }
    }else if(this.pagina > 1 && this.pagina < this.pagina_final && this.quantidade_paginas > 30){
        return [-1, 0, 1]
    }else{
      return [-2, -1, 0]
    }
  }

  mudar_pagina(mudar_para: number): void{
    this.define_pagina_final()
    if(this.pagina+mudar_para > 99){
      this.nova_pagina.emit(100)
    }else if(this.pagina+mudar_para < 0){
      this.nova_pagina.emit(1)
    }else{
      this.nova_pagina.emit(this.pagina+mudar_para)
    }
  }
}
