import { Injectable } from '@angular/core';
import { columnType } from '../model/column.type';

@Injectable({
  providedIn: 'root'
})

export class ColumnService {
  columnArray: Array<columnType> = [
    {
      title: 'A fazer',
      id: 0,
    },

    {
      title: 'Em andamento',
      id: 1,
    },

    {
      title: 'Concluído',
      id: 2,
    },
  ]

  getColumns() {
    return this.columnArray;
  }
  
}
