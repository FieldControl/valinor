import { Component, Output, EventEmitter } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CardsService } from 'src/app/cards/cards.service';





@Component({
  selector: 'app-form-card',
  standalone: true,
  imports: [MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './form-card.component.html',
  styleUrl: './form-card.component.scss'
})




export class FormCardComponent {
  titulo: string = '';
  descricao: string = '';
  cor: string = 'bg-blue-200  border  border-blue-600 rounded-lg';
  cardColumn: string = 'Fazer';

  constructor(
    public dialogRef: MatDialogRef<FormCardComponent>,
    private cardService: CardsService,
    
   
  ) { }

  submit() {
    const firstColumn = 'Fazer';
    const newCard = {
      title: this.titulo,
      description: this.descricao,
      color: this.cor,
      cardColumn: firstColumn
    };

    this.cardService.createCard(newCard).subscribe(
      response => {
        console.log('Card created:', response);
        this.dialogRef.close(response);
        
      },
      error => {
        console.error('Error creating card:', error);
      }
    );
    
    window.location.reload();
  }

  cancel() {
    this.dialogRef.close();
  }
}