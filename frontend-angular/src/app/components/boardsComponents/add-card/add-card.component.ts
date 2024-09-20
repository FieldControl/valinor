import { Component, inject } from '@angular/core';
import { filter, mergeMap } from 'rxjs';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, FormsModule, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog, } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Icard } from '../../../shared/interfaces/card.interface';
import { CardService } from '../../../shared/services/boards/card.service';
import { ConfirmComponent } from '../../../shared/confirm/confirm.component';
import { BoardService } from '../../../shared/services/boards/board.service';
import { CommonModule, NgIf } from '@angular/common';


@Component({
  selector: 'app-add-card',
  imports: [ ReactiveFormsModule, MatInputModule, MatButtonModule, MatDialogModule,FormsModule, CommonModule, NgIf],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.css',
  standalone: true,
})
export class AddCardComponent {
  private dialogRef = inject(MatDialogRef);
  private boardService = inject(BoardService);
  private fb = inject(NonNullableFormBuilder);
  private cardService = inject(CardService);
  data = inject(MAT_DIALOG_DATA);

  nameCard = '';
  contentCard = '';

  createOrEditCard(){
    // const newCard = this.fb.group( {
    //   order: this.fb.control(this.data.column?.cards?.length || + 1),
    //   boardId: this.fb.control(this.data.boardId),
    //   columnId: this.fb.control(this.data.column.id),
    //   name : this.fb.control(this.nameCard),
    //   content : this.fb.control(this.contentCard),

    // })
    const newCard: Partial<Icard> = {
      // order: (this.data.column?.cards?.length || + 1),
      boardId: (this.data.boardId),
      columnId: (this.data.column.id),
      name : this.nameCard,
      content : this.contentCard,

    }
    if(!newCard){
      return
    }

    if(this.data.card?.id){
      this.updateCard()
    }
    
    else{
      this.createCard()
    }
    
  }

  createCard(){
    const newCard: Partial<Icard> = {
      // order: (this.data.column.cards.length),
      boardId: (this.data.boardId),
      columnId: (this.data.column.id),
      name : this.nameCard,
      content : this.contentCard,
    }
    this.cardService.createCard(newCard).subscribe({
      complete: () => {
        this.reloadPage()
        this.closeDialog()
      },
    })
  }

  updateCard(){
    const newCard: Partial<Icard> = {
      // order: (this.data.column.cards.length),
      boardId: (this.data.boardId),
      columnId: (this.data.column.id),
      name : this.nameCard,
      content : this.contentCard,
    }
    this.cardService.updateCard(this.data.board?.id ,newCard).subscribe({
      complete: () => {
        this.reloadPage()
        this.closeDialog()
      },
    })
  }

  
  
  
  
  reloadPage(): void {
    window.location.reload();
  }

  closeDialog(){
    this.dialogRef.close();
  }









  
//   private readonly matDialog = inject(MatDialog);
//   private readonly dialogRef = inject(MatDialogRef);
//   private readonly fb = inject(NonNullableFormBuilder);
//   private readonly cardService = inject(CardService);
//   data = inject(MAT_DIALOG_DATA);

//   addCardForm = this.fb.group({
//     order: this.fb.control(this.data.column.cards.length),
//     boardId: this.fb.control(this.data.boardId),
//     columnId: this.fb.control(this.data.column.id),
//     name: this.fb.control(this.data.card?.name, [Validators.required]),
//     content: this.fb.control(this.data.card?.content, [Validators.required]),
//   });

//   createOrEditCard() {
//     if (this.addCardForm.invalid) {
//       return;
//     }

//     if (this.data.card?.id) {
//       this._updateCard();
//     } else {
//       this._createCard();
//     }
//   }

//   private _updateCard() {
//     this.cardService
//       .updateCard(this.data.card?.id, this.addCardForm.value as Partial<Icard>)
//       .subscribe((card: Icard) => {
//         this.dialogRef.close(card);
//       });
//   }

//   private _createCard() {
//     this.cardService
//       .createCard(this.addCardForm.value as Partial<Icard>)
//       .subscribe((card: Icard) => {
//         this.dialogRef.close(card);
//       });
//   }
//   deleteCard() {
//     if (!this.data.card?.id) return;
//     this.matDialog
//       .open(ConfirmComponent, {
//         data: {
//           title: 'Delete Card',
//           message: 'Are you sure you want to delete this card?',
//         },
//       })
//       .afterClosed()
//       .pipe(
//         filter((confirm) => confirm),
//         mergeMap(() => this.cardService.deleteCard(this.data.card.id))
//       )
//       .subscribe(() => this.dialogRef.close(true));
//   }

//   closeDialog() {
//     this.dialogRef.close();
//   }

}


