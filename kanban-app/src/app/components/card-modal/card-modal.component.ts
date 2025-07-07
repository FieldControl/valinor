import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Card,
  Column,
  CreateCardInput,
  UpdateCardInput,
} from '../../models/board.model';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ isEditMode ? 'Editar Card' : 'Novo Card' }}</h3>
          <button class="close-btn" (click)="close()">✕</button>
        </div>

        <div class="modal-body">
          <form (ngSubmit)="save()" #cardForm="ngForm">
            <div class="form-group">
              <label for="title">Título *</label>
              <input
                id="title"
                type="text"
                [(ngModel)]="formData.title"
                name="title"
                required
                class="form-control"
                placeholder="Digite o título do card"
                #titleInput
              />
            </div>

            <div class="form-group">
              <label for="description">Descrição</label>
              <textarea
                id="description"
                [(ngModel)]="formData.description"
                name="description"
                class="form-control"
                rows="4"
                placeholder="Digite a descrição do card (opcional)"
              ></textarea>
            </div>

            <div class="form-group" *ngIf="!isEditMode && columns.length > 1">
              <label for="column">Coluna</label>
              <select
                id="column"
                [(ngModel)]="selectedColumnId"
                name="column"
                class="form-control"
              >
                <option *ngFor="let column of columns" [value]="column.id">
                  {{ column.title }}
                </option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="close()">
                Cancelar
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="!cardForm.form.valid"
              >
                {{ isEditMode ? 'Atualizar' : 'Criar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styleUrl: './card-modal.component.scss',
})
export class CardModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() card: Card | null = null;
  @Input() columns: Column[] = [];
  @Input() defaultColumnId: string | null = null;

  @Output() cardCreate = new EventEmitter<CreateCardInput>();
  @Output() cardUpdate = new EventEmitter<UpdateCardInput>();
  @Output() modalClose = new EventEmitter<void>();

  formData = {
    title: '',
    description: '',
  };

  selectedColumnId: string | null = null;
  isEditMode = false;

  ngOnInit(): void {
    this.setupForm();
  }

  ngOnChanges(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.isEditMode = !!this.card;

    if (this.isEditMode && this.card) {
      this.formData = {
        title: this.card.title,
        description: this.card.description || '',
      };
      this.selectedColumnId = this.card.column.id;
    } else {
      this.formData = {
        title: '',
        description: '',
      };
      this.selectedColumnId =
        this.defaultColumnId || this.columns[0]?.id || null;
    }
  }

  save(): void {
    if (!this.formData.title.trim()) return;

    if (this.isEditMode && this.card) {
      // Atualizar card
      const updateData: UpdateCardInput = {
        id: Number(this.card.id),
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        columnId: Number(this.selectedColumnId),
      };
      this.cardUpdate.emit(updateData);
    } else {
      // Criar card
      const createData: CreateCardInput = {
        title: this.formData.title.trim(),
        description: this.formData.description.trim(),
        columnId: Number(this.selectedColumnId),
      };
      this.cardCreate.emit(createData);
    }

    this.close();
  }

  close(): void {
    this.modalClose.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      title: '',
      description: '',
    };
    this.selectedColumnId = null;
  }
}
