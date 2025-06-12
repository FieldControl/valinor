// src/app/features/board/board.component.ts
import { Component, OnInit }      from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { ColumnComponent }        from './column.component';
import { ColumnsApiService }      from '../../core/api/columns-api.service';
import { Column }                 from '../../shared/models/column.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,        // ← necessário para ngModel
    ColumnComponent,
  ],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];
  newColumnTitle = '';

  constructor(private colsApi: ColumnsApiService) {}

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.colsApi.getAll().subscribe(cols => {
      this.columns = cols;
      this.newColumnTitle = '';
    });
  }

  createColumn() {
    const title = this.newColumnTitle.trim();
    if (!title) return;
    this.colsApi.create({ title, order: this.columns.length })
      .subscribe(() => this.reload());
  }
}
