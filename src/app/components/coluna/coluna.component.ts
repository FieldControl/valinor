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
export class ColunaComponent {
    titulo: string = '';
    descricao: string = '';
    @Input() tituloColuna: string = '';
    @Input() classeColuna: string = '';
    @Input() classeTitulo: string = '';
    @Input() cards: Card[] = [];
}
