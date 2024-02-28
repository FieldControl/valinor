import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../../card';

@Component({
  selector: 'app-update-card',
  templateUrl: './update-card.component.html',
  styleUrls: ['./update-card.component.css']
})
export class UpdateCardComponent implements OnInit {

  // @Input() card: Card = {
  //   id: 0,
  //   title: "",
  //   date_created: new Date(),
  //   date_end: null,
  //   badges: [],
  //   description: null
  // }

  constructor() { }

  ngOnInit(): void {
  }

}
