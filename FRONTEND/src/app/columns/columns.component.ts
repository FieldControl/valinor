import { Component,OnInit, inject, signal, Input} from '@angular/core';
import { CardsComponent } from '../cards/cards.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ColumnsService } from './columns.service';
import { Column } from './columns.model';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/cards.model';
import { CommonModule } from '@angular/common';
import { CreateCardComponent } from '../cards/create-card/create-card.component';
import { FormCardComponent } from '../cards/form-card/form-card.component';



@Component({
  selector: 'app-columns',
  standalone: true,
  imports: [CardsComponent, NzCardModule, CommonModule, CreateCardComponent, FormCardComponent],
  templateUrl: './columns.component.html',
  styleUrl: './columns.component.scss'
})
export class ColumnsComponent {
  @Input() column !: Column;
  columns: Column[] = [];
  firstColumn: string = 'Fazer';
  cardColumn = signal<Column | null>(null);
  
  // encontra os cards para a coluna
  cardsService = inject(CardsService);
  cards = signal<Card[]>([]);
  ngOnInit(): void {
    this.getcards();
  }
  
  getcards(){
    this.cardsService.getcards()
      .subscribe((cards) => {
        this.cards.set(cards);
        
        
        
      })

  }

  


}