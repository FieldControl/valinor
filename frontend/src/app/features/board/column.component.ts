// src/app/features/board/column.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { CardComponent }    from './card.component';
import { Column }           from '../../shared/models/column.model';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss'],
})
export class ColumnComponent {
  @Input() column!: Column;
}
