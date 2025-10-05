// Angular Core
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-50 rounded-lg p-3">
      <form (ngSubmit)="onSubmit()" #cardForm="ngForm">
        <div class="mb-2">
          <input
            type="text"
            [(ngModel)]="cardData.title"
            name="title"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Título do card"
          />
        </div>
        <div class="mb-2">
          <textarea
            [(ngModel)]="cardData.description"
            name="description"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Descrição"
            rows="2"
          ></textarea>
        </div>
        <div class="mb-3">
          <select
            [(ngModel)]="cardData.priority"
            name="priority"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="low">Baixa</option>
            <option value="medium">Média</option>
            <option value="high">Alta</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            type="submit"
            [disabled]="!cardForm.form.valid || loading"
            class="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Adicionando...' : 'Adicionar' }}
          </button>
          <button
            type="button"
            (click)="onCancel()"
            class="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [],
})
export class AddCardFormComponent {
  @Input() loading = false;
  @Output() cardSubmit = new EventEmitter<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>();
  @Output() formCancel = new EventEmitter<void>();

  cardData = {
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  };

  onSubmit(): void {
    if (this.cardData.title.trim()) {
      this.cardSubmit.emit({ ...this.cardData });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm(): void {
    this.cardData = {
      title: '',
      description: '',
      priority: 'medium',
    };
  }
}
