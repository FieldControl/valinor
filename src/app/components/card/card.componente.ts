import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Card } from '../../services/cardService';
import {CdkDrag} from '@angular/cdk/drag-drop';




@Component({
    selector: 'card',
    imports: [CommonModule,CdkDrag],
    templateUrl: './card.component.html',
    styleUrl: './card.component.css'
})

export class CardComponent {
    @Input() parametrosCard!:Card;
}
