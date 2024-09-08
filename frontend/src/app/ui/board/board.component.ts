import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ColumnComponent } from "../column/column.component";
import { ColumnFormComponent } from "../columnForm/columnForm.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { Column } from "../../columnInterface";
import { ColumnsService } from '../../services/columns.service';

@Component({ 
  selector: "board", 
  templateUrl: "./board.component.html", 
  styleUrl: "./board.component.css",
  imports: [
    ColumnFormComponent, 
    MatIconModule,
    MatButtonModule,
    ColumnComponent
  ],
  standalone: true
})
export class BoardComponent implements OnInit{
  constructor(public matDialog:MatDialog, private columnsService:ColumnsService) {}
  columnList: Column[] = [];
  @Output() column = new EventEmitter<Column>();
  @Input() remove: Column = {id:'',order: 0 ,title:'',cards:[]};
  
  ngOnInit() {
    this.columnsService.findAll().subscribe((response) => {
      this.columnList = response;
    });
  }

  openDialog():void{
    const dialogRef = this.matDialog.open(ColumnFormComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if(result.title)this.addColumn(result.title);
    })
  }

  addColumn(columnTitle:string) {
    let column: Column = {id: '', order:this.columnList.length+1 ,title: columnTitle, cards: []};
    this.columnsService.create(column).subscribe((response) => {
      this.columnList.push(response);
      this.column.emit(response);
    });
  }

  removeColumn(column: Column) {
    let index = this.columnList.findIndex(e => e.id === column.id);
    if(index !== -1) this.columnList.splice(index,1);
    this.columnsService.remove(column.id).subscribe((response) => {});
  }
}