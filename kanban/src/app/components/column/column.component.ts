import { Component, Input, ViewChild } from '@angular/core';
import { ColumnService } from '../../services/column.service';
import { Observable, catchError, of, isEmpty } from 'rxjs';
import { Column } from '../../models/Column.interface';
import { Card } from '../../models/Card.interface';
import { CardComponent } from "../card/card.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-column',
  imports: [CommonModule, CardComponent, FormsModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent {

  @Input() column?: Column;
  @ViewChild(CardComponent) cardComponent!: CardComponent;

  columns$ = new Observable<Column[]>();
  newColumn: Column = { title: '', position: 0}
  newCard!: Card
  isModalOpen: boolean = false;
  isModalColumnOpen: boolean = false;
  isEditMode: boolean = false;

  constructor(private columnService: ColumnService) {
    this.getColumns();
  }

  saveCard(){
    this.closeModal();
    this.cardComponent.createCard(this.newCard)
    this.getColumns();
  }

  getColumns(){
    this.columns$ = this.columnService.getColumns()
  }

  OnDelete(id: number){
    if(confirm("Tem certeza que deseja excluir a coluna?")){
      this.columnService.deleteColumn(id).pipe(
        catchError(error => {
          alert(error.error.message);
          return of(null)
        })
      ).subscribe(() => {
        this.columns$ = this.columnService.getColumns();
      });    
    }
  }

  editMode(column: Column){
    this.newColumn = {
      id: column.id,
      title: column.title,
      position: column.position,
    }

    this.isModalColumnOpen = true;
    this.isEditMode = true;
  }

  save(){
    if(!this.isEditMode){
      this.createColumn();
      this.isModalColumnOpen = false;
    } else {
      this.updateColumn(this.newColumn.id!, this.newColumn);
    }
  }

  openModal() {
    this.isEditMode = false;
    this.isModalColumnOpen = true;
    this.newColumn = { title: '', position: 0 }
  }

  openCardModal(){
    this.isEditMode = false;
    this.isModalOpen = true;
    this.newCard = { title: '', description: '', position: 0, columnId: 0 }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isModalColumnOpen = false;
  }

  createColumn(){
    if(this.newColumn.position >= 0 && this.newColumn.title != ''){

      const columnData = {
        title: this.newColumn.title,
        position: this.newColumn.position
      }

      this.columnService.addColumn(columnData).pipe(
        catchError(error => {
          alert(error.error.message);
          return of(null)
        })
      ).subscribe(() => {
        this.getColumns();
      });
      
      this.isModalOpen = false;
    }
  }

  updateColumn(id: number, column: Column){
    this.columnService.updateColumn(id, column).pipe(
      catchError(error => {
        alert(error.error.message);
        return of(null)
      })
    ).subscribe(() => {
      this.getColumns();
    }); 

    this.isModalColumnOpen = false;
  }
}
