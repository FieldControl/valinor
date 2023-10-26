import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() height: string = '';
  @Input() mass: string = '';
  @Input() hairColor: string = '';
  @Input() eyeColor: string = '';
  @Input() gender: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
