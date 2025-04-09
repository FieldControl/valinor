import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { CardComponent } from '../card/card.componente';
import { CardService, Card } from '../../services/cardService';

@Component({
    selector: 'coluna',
    imports: [CommonModule, CardComponent],
    templateUrl: './coluna.component.html',
    styleUrl: './coluna.component.css'
   
    
})
export class ColunaComponent /*implements OnInit */{
    titulo: string = '';
    descricao: string ='';
    @Input() tituloColuna: string ='';
    @Input() classeColuna: string='';
    @Input() classeTitulo: string='';
    @Input () cards: Card[] = [];


    // constructor(private cardService: CardService) {
    // }

    // ngOnInit(): void {
    //     if (this.classeColuna.startsWith("coluna1")) { // verifica se o inicio da string é oq eu necessito tipo
    //         this.cardService.cardsAdicionados$.subscribe(novoCard => {
    //             this.cards.push(novoCard);
    //         })
    //     }

    //     //let cardsAberto = service.getItem("cards-em-aberto")
    //     //verificar qual coluna estou trabalhando
    //     //cards = cardsAberto
    // }
}
