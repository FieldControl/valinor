import { Injectable } from "@angular/core";//importo para o angular gerênciar a criação do meu serviçço
import { BehaviorSubject } from "rxjs";// importando um "carteiro" para realizar a comunicação entre componentes
import { filter } from "rxjs";//importanto um filtro  para encotrar um card válido, n nulo

export interface Card { //interface com as propriedades do meiu card
    id: number;
    titulo: string;
    descricao: string

  }
  
  @Injectable({ //configura para que o angular gerêncie meu serviço em toda minha aplicação
    providedIn: 'root'
  })
  export class CardService { //criando um serviço
    private cardsAdicionadosSource = new BehaviorSubject<Card | null>(null); // criando um "carteiro" que vai emitir eventos do tipo card ou nulos 
    cardsAdicionados$ = this.cardsAdicionadosSource.asObservable()
    .pipe(filter(card => card !== null)); // Filtra valores nulos iniciais
  
    private nextId = 1; // Simples gerador de ID
  
    adicionarCard(titulo: string, descricao:string) {
      const newCard: Card = { id: this.nextId++, titulo: 'titulo', descricao: 'descricao' };
      this.cardsAdicionadosSource.next(newCard);
      
    }
  }