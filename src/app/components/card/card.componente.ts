import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';


@Component({
    selector: 'card',
    imports: [CommonModule],
    templateUrl: './card.component.html',
    styleUrl: './card.component.css'
})
export class CardComponent {
    texto=''
}