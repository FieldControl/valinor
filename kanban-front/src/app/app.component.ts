import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Column } from './cards/model/column.model';
import { CardService } from './cards/service/card.service';
import { ColumnService } from './cards/service/column.service';
import { Card } from './cards/model/card.model';
import { CdkDragDrop, CdkDropList, CdkDropListGroup, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { response } from 'express';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    DragDropModule,
    CdkDropList,
    CdkDropListGroup,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    CardService,
    ColumnService,
        {
            provide: HTTP_INTERCEPTORS,
            useFactory: () => withFetch(),
            multi: true
        },
        HttpClient
    ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'kanban-front';
  

    columns: Column[] = [];
    connectedLists = [];
    titles: { [key: number]: string } = {};
    columnIds: string[] = [];
    
    constructor(
      private cardService: CardService,
      private columnService: ColumnService
    ) { }
  
    ngOnInit() {
      this.loadColumns();

    }

    checkAndAddColumn(title: string): void {
      if (!this.columns.find(column => column.title === title)) {
        this.addNewColumn(title);
      }
    }
    loadColumns(): void {
      this.columnService.getAllColumns().subscribe({
        next: (data: Column[]) => {
          
          this.columns = data;
          this.columnIds = this.columns.map(column => column.id.toString());
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
      // Verifica se já existe uma coluna com o mesmo título
      if (this.columns.some(column => column.title === title)) {
        console.log(`Coluna com o título "${title}" já existe. Não será duplicada.`);
        return; // Sai da função se a coluna já existir
      }
    
      // Se não existe, adiciona a nova coluna
      this.columnService.addNewColumn(title).subscribe({
        next: (newColumn) => {
          this.columns.push(newColumn);
        },
        error: (error) => {
          console.error('Erro ao criar nova coluna:', error);
        }
      });
    }
    
  
    addNewCardColumn(columnId: number, inputElement: HTMLInputElement): void {
      const title = inputElement.value;

      console.log('addNewCardColumn chamado para coluna ID:', columnId, 'com título:', title);
  
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
          },
          complete: () => {
            inputElement.value = '';
            const column = this.columns.find(c => c.id === columnId);
            if (column) {
              this.inputVisibility(column);
            }
          }
        });
      }
    }

    updateColumnTitle(column: Column, inputElement: HTMLInputElement): void {
      const newTitle = inputElement.value;

      if (newTitle) {
        column.title = newTitle;

        this.columnService.updateColumn(column.id, { title: newTitle }).subscribe({
          next: (updatedColumn) => {
            column.isEditing = false;
          },
          error: (error) => {
            console.error('Failed to update column title', error);

          }
        });
      } else {
        column.isEditing = false;
      }
    }
  
    onDrop(event: CdkDragDrop<any[]>): void {
      console.log("Coluna ID: " + this.columnIds);
      console.log(event.previousContainer.data);
      console.log(event.container.data);
      console.log(event.previousIndex);
      console.log(event.currentIndex);
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(event.previousContainer.data,
                          event.container.data,
                          event.previousIndex,
                          event.currentIndex);
        
        this.updateBackend(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      }
    }

    private updateBackend(previousCards: any[], currentCards: any[], prevIndex: number, currIndex: number): void {
      console.log(previousCards);
      console.log(currentCards);
      console.log(prevIndex);
      console.log(currIndex);


      const updateData = {
        previousColumnId: previousCards[prevIndex]?.columnId,
        currentColumnId: currentCards[currIndex]?.columnId,
        card: currentCards[currIndex]  
      };
    
      this.cardService.updateCardLocation(updateData).subscribe({
        next: response => {
          console.log('Update successful:', response);
        },
        error: error => {
          console.error('Failed to update:', error);
        }
      });
    }
    
    inputVisibility(column: Column): void {
      column.showInput = !column.showInput;
    }  

    enableEditing(column: Column): void {
      column.isEditing = true;
    }
  
    trackByFn(index: number, item: any): any {
      return item.id;
    }
  }
