import { Component, Input, OnInit } from '@angular/core';
import { Card } from '../card';

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

  constructor() { }

  ngOnInit(): void {
    
  }

}
