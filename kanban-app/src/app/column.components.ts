import { Component, Input } from '@angular/core';
import { Column } from './models/column.model';

@Component({
  selector: 'column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent {

  @Input()
    column!: Column;

  // ...

}