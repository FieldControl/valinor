import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModel } from '../../models/card.model';
import { CommonModule } from '@angular/common';
import { ColumnModel } from '../../models/column.model';

@Component({
  selector: 'app-card-edit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-edit-form.html',
  styleUrl: './card-edit-form.scss'
})
export class CardEditForm {
  @Input() isOpen: boolean = false;
  @Input() card!: CardModel;
  @Input() columns: ColumnModel[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<{content: string}>()

  content: string = '';

  ngOnInit(): void {
    if(this.card) {
      this.content = this.card.content
    }
  }
  
  isContentValid(): boolean{
    return this.content.trim().length > 0
  }

  canSubmit(): boolean {
    return this.isContentValid()
  }

  getErrors(): string {
    if(!this.isContentValid()) {
      return 'O conteúdo da nota é obrigatório!'
    }
    return '';
  }

  reset(): void {
    if(this.card) {
      this.content = this.card.content
    }
  }
  
  close(): void {
    this.reset();
    this.onClose.emit();
  }

  submit(): void {
    if(this.isContentValid()) {
      this.onSubmit.emit({
        content: this.content,
      });
      this.reset()
      this.close()
    }
  }
}
