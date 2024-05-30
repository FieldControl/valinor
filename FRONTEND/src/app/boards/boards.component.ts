import { Component, OnInit, inject, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ColumnsComponent } from '../columns/columns.component';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BoardsService } from './boards.service';
import { Column } from '../columns/columns.model';
import { ColumnsService } from '../columns/columns.service';


@Component({
  selector: 'app-boards',
  standalone: true,
  imports: [NzCardModule, ColumnsComponent, CommonModule],
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.scss'
})


export class BoardsComponent implements OnInit {
  //encontra as colunas no inicio
  constructor(private boardsService: BoardsService) { }
  columnsService = inject(ColumnsService);
  columns = signal<Column[]>([]);
  ngOnInit(): void {
    this.getColumns();
  }

 
  getColumns(){
    this.columnsService.getColumns()
      .subscribe((columns) => {
        this.columns.set(columns);
        
      })
  }
    
  

  

  

}