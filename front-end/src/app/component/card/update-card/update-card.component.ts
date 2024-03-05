import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Card } from '../../card';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Badge } from '../../badge';
import { BadgeService } from 'src/app/badge.service';
import { KanbanService } from 'src/app/kanban.service';
import Swal from 'sweetalert2';

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
  habilityUpdateTitle: boolean = false;
  @ViewChild('inputTitle') inputTitle: any;

  constructor(public dialogRef: MatDialogRef<UpdateCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private serviceBadge: BadgeService, private serviceKanban: KanbanService) { }

  closeModal(): void {
    this.dialogRef.close();
  }

  deleteCard(idCard: number, idList: number) {
    Swal.fire({
      icon: "error",
      title: "Deletar Lista ?",
      html: "Ao proceguir voce irá deletar a lista e todos os Cartões que nela está <b>Não terá como reverter !!</b>",
      confirmButtonText: "Deletar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#0d6efd",
      showCancelButton: true,
      allowOutsideClick: false
    }).then((response) => {
      if(response.isConfirmed){
        // this.serviceKanban.deleteCard(idCard,idList).subscribe((cardDeleted: Card) => {
          //TODO usar rota

        // })
      }
    });
  }

  updateCard(card: Card, idList: number) {
    debugger
    this.data.card = card;
    // this.serviceKanban.updateCard(card,idList).subscribe((cardUpdated: Card) => {
    //TODO usar rota

    // })
  }

  ngOnInit(): void {
    console.log(this.dialogRef);

    this.serviceBadge.list().subscribe((badges: Badge[]) => {
      this.badges = badges;
    });
  }

  ngAfterViewChecked():void{
    if(this.habilityUpdateTitle){
      this.inputTitle.nativeElement.focus()
    }
  }

}
