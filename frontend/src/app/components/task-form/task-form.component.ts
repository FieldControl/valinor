import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  @Input() taskName: string = '';
  @Output() taskSubmitted = new EventEmitter<string>(); // Nome mais explícito
  @Output() canceled = new EventEmitter<void>();

  onSubmit(event: Event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário
    if (this.taskName.trim()) {
      this.taskSubmitted.emit(this.taskName); // Emite apenas a string
    }
  }

  onCancel() {
    this.canceled.emit();
  }
}