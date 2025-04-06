import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Card } from '../../services/cardService';



@Component({
    selector: 'card',
    imports: [CommonModule],
    templateUrl: './card.component.html',
    styleUrl: './card.component.css'
})

export class CardComponent {
    @Input() parametrosCard!:Card;
}
