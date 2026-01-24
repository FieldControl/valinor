import { Component, OnInit } from '@angular/core';
import { ColumnsService, Column } from '../columns.service';

@Component({
  selector: 'app-columns',
  templateUrl: './columns.component.html',
  styleUrls: ['./columns.component.css']
})
export class ColumnsComponent implements OnInit {
  columns: Column[] = [];
  newTitle: string = '';

  constructor(private columnsService: ColumnsService) {}

  ngOnInit(): void {
    this.loadColumns();
  }

  loadColumns(): void {
    this.columnsService.getColumns().subscribe(data => {
      this.columns = data;
    });
  }

  addColumn(): void {
    if (this.newTitle.trim()) {
      this.columnsService.addColumn(this.newTitle).subscribe(column => {
        this.columns.push(column);
        this.newTitle = '';
      });
    }
  }
}
