// Angular Core
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-column-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-w-[300px]">
      <button
        (click)="toggleForm()"
        class="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <div class="text-center">
          <div class="text-2xl text-gray-400 mb-2">+</div>
          <div class="text-gray-500 font-medium">Adicionar Coluna</div>
        </div>
      </button>

      <div *ngIf="showForm" class="mt-4 bg-white rounded-lg shadow-md p-4">
        <h3 class="text-lg font-semibold mb-3">Nova Coluna</h3>
        <form (ngSubmit)="onSubmit()" #columnForm="ngForm">
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Título</label
            >
            <input
              type="text"
              [(ngModel)]="columnData.title"
              name="title"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: To Do"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Descrição</label
            >
            <textarea
              [(ngModel)]="columnData.description"
              name="description"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da coluna"
              rows="2"
            ></textarea>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Cor</label
            >
            <input
              type="color"
              clear
              [(ngModel)]="columnData.color"
              name="color"
              class="w-full h-10 border border-gray-300 rounded-md"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              [disabled]="!columnForm.form.valid || loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Adicionando...' : 'Adicionar' }}
            </button>
            <button
              type="button"
              (click)="onCancel()"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [],
})
export class AddColumnFormComponent {
  @Input() loading = false;
  @Output() columnSubmit = new EventEmitter<{
    title: string;
    description: string;
    color: string;
  }>();
  @Output() formCancel = new EventEmitter<void>();

  showForm = false;
  columnData = {
    title: '',
    description: '',
    color: '#3B82F6',
  };

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.columnData.title.trim()) {
      this.columnSubmit.emit({ ...this.columnData });
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.resetForm();
    this.formCancel.emit();
  }

  private resetForm(): void {
    this.columnData = {
      title: '',
      description: '',
      color: '#3B82F6',
    };
  }
}
