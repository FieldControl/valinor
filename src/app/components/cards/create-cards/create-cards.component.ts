import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from '../card';
import { CardService } from '../services/card.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnService } from '../../columns/services/column.service';
import { Column } from '../../columns/column/column';

@Component({
  selector: 'app-create-cards',
  templateUrl: './create-cards.component.html',
  styleUrls: ['./create-cards.component.scss']
})
export class CreateCardsComponent implements OnInit{

  @Input() columnId!: number;
  card : Card = {
    task: '',
    id: 0
  }

  constructor(private columnService: ColumnService, private router: Router, private route: ActivatedRoute,){
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.columnId = +params['columnId'];
    });
  }




      createCard() {
        this.columnService.addCard(this.columnId, this.card).subscribe(
          (updatedColumn: Column) => {
            console.log('Coluna atualizada com novo card:', updatedColumn);
            this.router.navigate(['/listColumns']);
          },
          (error) => {
            console.error('Erro ao atualizar coluna com novo card:', error);
          }
        );
      }


}
