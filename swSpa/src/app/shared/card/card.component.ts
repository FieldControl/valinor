import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

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
  @Input() films: string[] = [];

  constructor(public _dialog: MatDialog) { }
  
  shouldOpenModal: boolean = false;

  ngOnInit(): void {
  }

  openDialog(title: string) {
    this._dialog.open(DialogComponent, 
    {
      data: {title: title,
             films: this.films },
    });
  }
}
