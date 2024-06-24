import { Component, OnInit } from '@angular/core';
import { ColumnService } from './components/columns/services/column.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  columns: any[] = [];

  constructor(private columnService: ColumnService){}

  ngOnInit(): void {
    this.columnService.getColumns().subscribe(data => {
      this.columns = data;
    })
  }
  title = 'fieldproject';
}
