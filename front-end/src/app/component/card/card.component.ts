import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../card';
import { MatDialog } from '@angular/material';
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

  constructor(public dialog: MatDialog) { }

  async editCard(idCard: number) {
    this.dialog.open(UpdateCardComponent)
  }

  ngOnInit(): void {

  }

}
