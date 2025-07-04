import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CardModel, ColumnModel } from '../../models/kanban.model';
import { Column } from "../column/column";
import { CommonModule } from '@angular/common';
import { FormCard } from "../form-card/form-card";
import { KanbanService } from './kanban.service';
import { FormColumn } from '../form-column/form-column';


@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [Column, CommonModule, FormCard, FormColumn],
  templateUrl: './kanban.html',
  styleUrl: './kanban.css'
})
export class Kanban implements OnInit {

  showFormCard = false;
  selectColumnId!: string;
  showFormColumn = false;
  
  columns: ColumnModel[] = []
  cards: CardModel[] = []

  constructor(private kanbanService: KanbanService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.loadKanbanData();
  }

  loadKanbanData(): void{
    this.kanbanService.getColumns().subscribe({
      next: (cols) => {
        this.columns = cols;
        this.cdr.detectChanges();
        console.log('Columns Loaded: ', this.columns);
      },
      error: (e) =>{
        console.error('Error to load the columns', e);
      }
    })
  }


  openFormCard(columnId: string): void{
    this.selectColumnId = columnId;
    this.showFormCard = true;
  }

   cardFormClosed(): void {
    this.showFormCard = false;
    this.selectColumnId = '';
    this.loadKanbanData();
   
  }

  openFormColumn(): void{
    this.showFormColumn = true;
  }

  columnFormClosed(): void {
    this.showFormColumn = false;
    this.loadKanbanData();
  }

}
