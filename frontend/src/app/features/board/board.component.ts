// src/app/features/board/board.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { ColumnComponent }   from './column.component';
import { DummyService }      from './dummy.service';
import { Column }            from '../../shared/models/column.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ColumnComponent],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  columns: Column[] = [];

  constructor(private ds: DummyService) {}

  ngOnInit() {
    this.columns = this.ds.getColumns();
  }
}
