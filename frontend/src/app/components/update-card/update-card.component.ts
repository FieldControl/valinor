import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Card } from '../../models/card';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Badge } from '../../models/badge';
import { BadgeService } from 'src/app/services/badge.service';
import Swal from 'sweetalert2';
import { CardService } from 'src/app/services/card.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { HttpErrorResponse } from '@angular/common/http';
import { ExceptionErrorsMessage } from 'src/app/utils/exception-errors-message';

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

  constructor(
      public dialogRef: MatDialogRef<UpdateCardComponent>,
      @Inject(MAT_DIALOG_DATA)
      public data: DialogData,
      private serviceBadge: BadgeService,
      private serviceCard: CardService,
      private errorMessages: ExceptionErrorsMessage
    ) { }

  closeModal(params?: object): void {
    this.dialogRef.close(params);
  }

  async deleteCard(idCard: string) {
    this.serviceCard.deleteCard(idCard).subscribe((response: any) => {
      console.log('log response card',response.card);
      Swal.fire({
        title: response.message,
        icon: 'success'
      }).then(() => {
        this.closeModal({deleted: true})
      })
    }, (exception: HttpErrorResponse) => this.errorMessages.exceptionError(exception))
  }

  async deleteCardQuestion(idCard: string){
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
      if (response.isConfirmed) {
        this.deleteCard(idCard)
      }
    });
  }

  updateCard(card: Card) {
    const inputElement = document.querySelector("#date_end");
    let date_end: Date|null|undefined = null;
    if(inputElement){
      const input = inputElement as HTMLInputElement
      date_end = new Date(`${input.value} 00:00:00`);
    }
    card.date_end = date_end;
    this.data.card = card;
    this.serviceCard.updateCard(card).subscribe()
  }

  isBadgeChecked(badgeId: string): boolean {
    return !!this.data.card.badges?.find(badge => badge.id === badgeId);
  }

  onCheckboxChange($event: MatCheckboxChange, card_id:string) {

    if($event.checked){
      this.serviceCard.linkBadgeToCard(card_id, $event.source.value).subscribe((response: any) => {
        this.data.card.badges = response.link.badges;
      });
    }else{
      this.serviceCard.unlinkBadgeToCard(card_id, $event.source.value).subscribe((response: any) => {
        this.data.card.badges = response.unlink.badges;
      });
    }
  }

  ngOnInit(): void {
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
