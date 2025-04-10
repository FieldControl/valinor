import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Card } from '../../services/cardService';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'card',
    imports: [CommonModule, CdkDrag, FormsModule],
    templateUrl: './card.component.html',
    styleUrl: './card.component.css'
    
})


  
export class CardComponent {
    @Input() parametrosCard!: Card;
    desabilita: boolean = false;

    onBlur() {
        this.desabilita = true;
    }
    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.desabilita = true;
        }

    }
    habilitaInput(){
        this.desabilita=false
    }

}
