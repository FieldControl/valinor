import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ColumnService } from '../../services/column.service'; // Serviço que irá enviar os dados para o backend

@Component({
  selector: 'app-add-column-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [ColumnService],
  templateUrl: './add-column-modal.component.html',
  styleUrl: './add-column-modal.component.css',
})
export class AddColumnModalComponent {
  @Output() closeAddColumnEvent = new EventEmitter<void>();

  closeAddColumnModal() {
    this.closeAddColumnEvent.emit();
  }

  columnForm!: FormGroup;

  colors = [
    { hexCode: '#daa700', colorName: 'Amarelo' },
    { hexCode: '#00a2ff', colorName: 'Azul' },
    { hexCode: '#03ad03', colorName: 'Verde' },
    { hexCode: '#D32F2F', colorName: 'Vermelho' },
    { hexCode: '#f295fc', colorName: 'Rosa' },
    { hexCode: '#ffffff', colorName: 'Branco' },
  ];

  constructor(private columnService: ColumnService) {
    this.columnForm = new FormGroup({
      columnName: new FormControl('', [Validators.required]),
      color: new FormControl('', [Validators.required]),
    });
  }

  hadError: boolean = false;
  isLoading: boolean = false;

  onSubmit() {
    if (this.columnForm.valid) {
      const { columnName, color } = this.columnForm.value;

      this.isLoading = true;

      this.columnService.createColumn(columnName, color).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeAddColumnModal();
        },
        error: () => {
          this.isLoading = false;
          this.hadError = true;
        },
      });
    }
  }
}
