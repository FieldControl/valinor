import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Card } from '../../interfaces/card';
import { CardService } from '../../services/card.service';
import { MatDialog } from '@angular/material/dialog';
import { EditCardModalComponent } from '../edit-card-modal/edit-card-modal.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input({ required: true }) card!: Card;

  constructor(
    private cardService: CardService,
    public dialog: MatDialog
  ) {}

  editCard(card: Card): void {
    this.dialog.open(EditCardModalComponent, {
      data: { card },
    });
  }

  deleteCard(card: Card): void {
    this.cardService.deleteCard(card.id);
  }
}
