import { Component, OnInit } from '@angular/core';
import { ColumnService } from '../services/column.service';
import { Column } from '../column/column';

@Component({
  selector: 'app-list-columns',
  templateUrl: './list-columns.component.html',
  styleUrls: ['./list-columns.component.scss']
})
export class ListColumnsComponent implements OnInit{

  listColumns: Column[] = []

  constructor(private service: ColumnService){}

  ngOnInit(): void {
    this.service.getColumns().subscribe((listColumns) => {
      this.listColumns = listColumns
    })
  }

}
