import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ColumnModel } from '../../models/column.model';

@Component({
  selector: 'app-card-form',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './card-form.html',
  styleUrl: './card-form.scss'
})
export class CardForm {
  @Input() isOpen: boolean = false;
  @Input() currentColumnId: string = ''
  @Input() columns: ColumnModel[] = []
  @Output() onClose = new EventEmitter<void>()
  @Output() onSubmit = new EventEmitter<{content: string, columnId: string}>()

  content: string = ''
  selectedColumnId: string = ''

  isContentValid(): boolean{
    return this.content.trim().length > 0
  }

  isColumnValid(): boolean {
    return this.selectedColumnId.length > 0 
  }

  canSubmit(): boolean {
    return this.isContentValid() && this.isColumnValid()
  }

  getErrors(): string {
    if(!this.isContentValid()) {
      return 'O conteúdo da nota é obrigatório!'
    }
    if(!this.isColumnValid()) {
      return 'Selecione uma coluna para prosseguir!'
    }
    return '';
  }

  reset(): void {
    this.content = ''
    this.selectedColumnId = ''
  }

  close(): void {
    this.reset();
    this.onClose.emit();
  }

  submit(): void {
    if(this.canSubmit()) {
      this.onSubmit.emit({
        content: this.content.trim(),
        columnId: this.selectedColumnId
      });
      this.reset()
      this.close()
    }
  }
}
