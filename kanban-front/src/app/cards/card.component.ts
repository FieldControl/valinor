import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Column } from './model/column.model';
import { CardService } from './service/card.service';
import { ColumnService } from './service/column.service';
import { Card } from './model/card.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone:true,
  imports: [
    CommonModule,
    DragDropModule
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  columns: Column[] = [];
  connectedLists = [];
  titles: { [key: number]: string } = {};
  allLists: string = "";
  
  constructor(
    private cardService: CardService,
    private columnService: ColumnService
  ) { }

  ngOnInit() {
    this.loadColumns();
  }
  
  loadColumns(): void {
    this.columnService.getAllColumns().subscribe({
      next: (data: Column[]) => {
        this.columns = data;

        this.loadCards();
      },
      error: (error) => {
        console.error('Failed to load columns:', error);
      }
    });
  }

  loadCards(): void {
    this.columns.forEach(column => {
      this.cardService.getCardsByColumnId(column.id).subscribe({
        next: (cards: Card[]) => {
          column.card = cards;
        },
        error: (error) => {
          console.error(`Failed to load cards for column ${column.title}:`, error);
        }
      });
    });
  }

  addNewColumn(title: string): void {
    this.columnService.addNewColumn(title).subscribe({
      next: (newColumn) => {
        this.columns.push(newColumn)
      },
      error: (error) => {
        console.error('Erro ao criar nova coluna:', error);
      }
    });
  }

  addNewCardColumn(columnId: number): void {
    console.log('addNewCardColumn chamado para coluna ID:', columnId);
    const title = this.titles[columnId];

    if (title) {
      this.cardService.addNewCardColumn(columnId, title).subscribe({
        next: (newCard) => {
          const column = this.columns.find(column => column.id == columnId);

          if (column) {
            column.card.push(newCard);
            this.loadCards();
          } else {
            console.error('Coluna não encontrada para adicionar o novo card');
          }
          
        },
        error: (error) => {
          console.error('Erro ao criar novo card:', error);
        }
      });
    }
  }

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  allColumns(): void {
    this.columnService.getAllColumns().subscribe({
      next: (data: Column[]) => {
        this.allLists = data.map(column => column.title).join(',');
        console.log(this.allLists);
      },
      error: (error) => {
        console.error('Failed to get columns:', error);
      }
    });
  }
  
  inputVisibility(column: Column): void {
    console.log('Visibilidade da entrada:', column.showInput);
    column.showInput = true;
    console.log('Visibilidade da entrada:', column.showInput);
  }  

  trackByFn(index: number, item: any): any {
    return item.id;
  }
}