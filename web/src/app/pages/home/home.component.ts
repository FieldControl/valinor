import { Component, OnInit } from '@angular/core';

import { Column } from '../../types/column.interface';
import { ColumnsService } from '../../services/columns.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  columns: Column[] = [];

  constructor(private columnsService: ColumnsService) {}

  ngOnInit(): void {
    this.columnsService.getAllColumns().subscribe((response) => {
      this.columns = response;
    });
  }
}
