import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card } from '../../card';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Badge } from '../../badge';
import { BadgeService } from 'src/app/badge.service';
import { KanbanService } from 'src/app/kanban.service';
import Swal from 'sweetalert2';
import { CardService } from 'src/app/card.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private serviceBadge: BadgeService, private serviceCard: CardService) { }

  closeModal(): void {
    this.dialogRef.close();
  }

  deleteCard(idCard: string) {
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
        this.serviceCard.deleteCard(idCard).subscribe((response: any) => {
          console.log(response);
          Swal.fire({
            title: response.message,
            icon: 'success'
          }).then(() => {
            this.dialogRef.close({deleted: true});
          })
        })
      }
    });
  }

  updateCard(card: Card) {
    this.data.card = card;
    this.serviceCard.updateCard(card).subscribe((response: any) => {
    })
  }

  isBadgeChecked(badgeId: string): boolean {
    return !!this.data.card.badges!.find(badge => badge.id === badgeId);
  }

  onCheckboxChange($event: MatCheckboxChange, card_id:string) {

    if($event.checked){
      this.serviceCard.linkBadgeToCard(card_id, $event.source.value).subscribe((response: any) => {
        this.data.card.badges = response.link.badges;
      });
    }else{
      this.serviceCard.unlinkBadgeToCard(card_id, $event.source.value).subscribe((response: any) => {
        debugger
        this.data.card.badges = response.unlink.badges;
      });
    }
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
