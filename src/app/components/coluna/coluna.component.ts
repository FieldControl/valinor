import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardComponent } from '../card/card.componente';

@Component({
    selector: 'coluna',
    imports: [CommonModule,CardComponent],
    templateUrl: './coluna.component.html',
    styleUrl: './coluna.component.css'
})
export class ColunaComponent {
   
}