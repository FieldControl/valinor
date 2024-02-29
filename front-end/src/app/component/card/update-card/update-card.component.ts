import { Component, Inject, Input, OnInit } from '@angular/core';
import { Card } from '../../card';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Badge } from '../../badge';
import { BadgeService } from 'src/app/badge.service';

export interface DialogData {
  idList: number
  nameList: string
  card: Card
}

@Component({
  selector: 'app-update-card',
  templateUrl: './update-card.component.html',
  styleUrls: ['./update-card.component.css']
})
export class UpdateCardComponent implements OnInit {

  openBadge: boolean = false;
  badges: Badge[] = []

  constructor(public dialogRef: MatDialogRef<UpdateCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private service: BadgeService) { }

  closeModal(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.service.list().subscribe((badges: Badge[]) => {
      this.badges = badges;
    });
  }

}
