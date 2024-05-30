import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CardsService } from 'src/app/cards/cards.service';
import { Inject } from '@angular/core';
import { Card } from 'src/app/cards/cards.model';

@Component({
  selector: 'app-open-card',
  standalone: true,
  imports: [
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './open-card.component.html',
  styleUrls: ['./open-card.component.scss']
})

//salva o que esta no pop up
export class OpenCardComponent{
  titulo: string = this.data.title;
  descricao: string = this.data.description;
  cor: string   = this.data.color;
  coluna: string = this.data.cardColumn;

  constructor(
    public dialogRef: MatDialogRef<OpenCardComponent>,
    private cardService: CardsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  

  submit() {
    const updatedCard = {
      id: this.data.cardId, // Inclua o ID do card a ser atualizado
      title: this.titulo,
      description: this.descricao,
      color: this.cor,
      cardColumn: this.coluna
    };

    this.cardService.updateCard(updatedCard).subscribe(
      response => {
        console.log('Card updated:', response);
        this.dialogRef.close(response);
      },
      error => {
        console.error('Error updating card:', error);
      }
    );

    window.location.reload();
  }

  cancel() {
    this.dialogRef.close();
  }

  delete() {
    this.cardService.deleteCard(this.data.cardId).subscribe(
      response => {
        console.log('Card deleted:', response);
        this.dialogRef.close();
      },
      error => {
        console.error('Error deleting card:', error);
      }
    )

    window.location.reload();
  }
}