import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Card } from '../card';
// import { MatDialog } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdateCardComponent } from './update-card/update-card.component';
import { isEmpty } from 'rxjs';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: Card = {
    id: "",
    kanban_id: "",
    title: "",
    createdAt: new Date(),
    date_end: null,
    order: 0,
    badges: [],
    description: null
  }
  @Input() nameList: string = "";
  @Input() idList: string = "";
  @Output() cardRemoved = new EventEmitter<string>();

  constructor(public dialog: MatDialog) { }

  async editCard(idCard: string) {
    console.log(this.card);
    //TODO: PENSAR EM RESPONSIVIDADE
    // const screenWidth:number = window.innerWidth;
    // console.log(`Width: ${screenWidth}`);

    const dialogRef = this.dialog.open(UpdateCardComponent,{
      data: {card: this.card, nameList: this.nameList, idList: this.idList.toString()},
      width: `639px`,
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result !== undefined){
        if(result.deleted){
          this.cardRemoved.emit(idCard);
        }
      }
    });
  }

  ngOnInit(): void {

  }

}
