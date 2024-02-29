import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../card';
// import { MatDialog } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UpdateCardComponent } from './update-card/update-card.component';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() card: Card = {
    id: 0,
    title: "",
    date_created: new Date(),
    date_end: null,
    badges: [],
    description: null
  }
  @Input() nameList: string = "";
  @Input() idList: number = 0;

  constructor(public dialog: MatDialog) { }

  async editCard(idCard: number) {
    console.log(this.card);
    this.dialog.open(UpdateCardComponent,{
      width:'50%',
      height: "70%",
      data: {card: this.card, nameList: this.nameList, idList: this.idList}
    })
  }

  ngOnInit(): void {

  }

}
