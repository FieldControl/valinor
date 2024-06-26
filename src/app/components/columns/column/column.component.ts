import { Component, Input, OnInit } from '@angular/core';
import { Column } from './column';
import { Router } from '@angular/router';
import { ColumnService } from '../services/column.service';

@Component({
  selector: 'app-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.scss']
})
export class ColumnComponent implements OnInit{

  @Input() column: Column = {
    id: 0,
    name: 'Angular',
    cards: [{
      task: 'Persistir',
      id: 0
    }]
  }

  constructor(private router: Router, private columnService: ColumnService){}

  ngOnInit(): void {

  }

  addCard(columnId: number): void {
    console.log('entrando no addCard')
    this.router.navigate([`/createCards/${columnId}/cards`]);
  }




  excluirColumn() {
    if(this.column.id) {
      this.columnService.deleteColumn(this.column.id).subscribe(() => {
        this.router.navigate(['/listColumns'])
      })
    }
  }

}
