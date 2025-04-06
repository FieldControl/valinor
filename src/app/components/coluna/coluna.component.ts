import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.componente';
import { CardService, Card } from'../../services/cardService'

@Component({
    selector: 'coluna',
    imports: [CommonModule,CardComponent],
    templateUrl: './coluna.component.html',
    styleUrl: './coluna.component.css'
})
export class ColunaComponent  {
  
}