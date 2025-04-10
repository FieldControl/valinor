import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardComponent } from "../card/card.component";
import { ColumnService } from './../../../services/column.service';

@Component({
  selector: 'app-column',
  imports: [CardComponent,CommonModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent {
  columns: any[] = [];

  constructor(private columnService: ColumnService) {}

  ngOnInit() {
    this.columns = this.columnService.getColumns(); 
  }
  
}
