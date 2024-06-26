import { Component, EventEmitter, Output } from '@angular/core';
import { ColumnService } from '../services/column.service';
import { Column } from '../column/column';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-columns',
  templateUrl: './create-columns.component.html',
  styleUrls: ['./create-columns.component.scss']
})
export class CreateColumnsComponent{

  column : Column = {
    name: '',
    cards: [],
    id: 0
  }

  constructor(private columnService: ColumnService, private router: Router) { }

  createColumn() {
    this.columnService.createColumn(this.column).subscribe(() => {
      this.router.navigate(['/listColumns'])
    })
  }

  cancelar(){
    this.router.navigate(['/listColumns'])
  }

}
