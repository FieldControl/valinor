import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-column-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      (click)="onBackdropClick($event)"
      (keyup.escape)="onCancel()"
      (keydown.escape)="onCancel()"
      tabindex="0"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        (click)="$event.stopPropagation()"
        (keyup.escape)="onCancel()"
        (keydown.escape)="onCancel()"
        tabindex="0"
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              Adicionar Nova Coluna
            </h3>
            <button
              (click)="onCancel()"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" #columnForm="ngForm">
            <div class="mb-4">
              <label
                for="title"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Título *
              </label>
              <input
                type="text"
                id="title"
                [(ngModel)]="columnData.title"
                name="title"
                required
                data-testid="column-title-input"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nome da coluna"
              />
            </div>

            <div class="mb-4">
              <label
                for="description"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Descrição
              </label>
              <textarea
                id="description"
                [(ngModel)]="columnData.description"
                name="description"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição da coluna (opcional)"
                rows="3"
              ></textarea>
            </div>

            <div class="mb-6">
              <label
                for="color"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Cor
              </label>
              <div class="flex gap-2 flex-wrap">
                <button
                  *ngFor="let color of colorOptions"
                  type="button"
                  (click)="selectColor(color)"
                  class="w-8 h-8 rounded-full border-2 transition-all"
                  [class]="
                    columnData.color === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  "
                  [style.background-color]="color"
                  [title]="getColorName(color)"
                ></button>
              </div>
            </div>

            <div class="flex gap-3 justify-end">
              <button
                type="button"
                (click)="onCancel()"
                class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                [disabled]="!columnForm.form.valid || loading"
                data-testid="add-column-submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? 'Adicionando...' : 'Adicionar Coluna' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AddColumnDialogComponent {
  @Input() isOpen = false;
  @Input() loading = false;
  @Output() columnSubmit = new EventEmitter<{
    title: string;
    description: string;
    color: string;
  }>();
  @Output() dialogCancel = new EventEmitter<void>();

  columnData = {
    title: '',
    description: '',
    color: '#3B82F6',
  };

  colorOptions = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  selectColor(color: string): void {
    this.columnData.color = color;
  }

  getColorName(color: string): string {
    const colorNames: { [key: string]: string } = {
      '#3B82F6': 'Azul',
      '#10B981': 'Verde',
      '#F59E0B': 'Amarelo',
      '#EF4444': 'Vermelho',
      '#8B5CF6': 'Roxo',
      '#F97316': 'Laranja',
      '#06B6D4': 'Ciano',
      '#84CC16': 'Lima',
      '#EC4899': 'Rosa',
      '#6B7280': 'Cinza',
    };
    return colorNames[color] || color;
  }

  onSubmit(): void {
    if (this.columnData.title.trim()) {
      this.columnSubmit.emit({ ...this.columnData });
      this.resetForm();
    }
  }

  onCancel(): void {
    this.resetForm();
    this.dialogCancel.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  private resetForm(): void {
    this.columnData = {
      title: '',
      description: '',
      color: '#3B82F6',
    };
  }
}
