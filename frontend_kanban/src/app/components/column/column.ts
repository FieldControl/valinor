import { Component, Input } from '@angular/core';
import { ColumnModel, CardModel } from '../../models/kanban.model';
import { Card } from "../card/card";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-column',
  imports: [Card, CommonModule],
  templateUrl: './column.html',
  styleUrl: './column.css'
})
export class Column{

  @Input() columnModel!: ColumnModel;


}
  