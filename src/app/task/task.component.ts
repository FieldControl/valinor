import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from './task';
// Componente para card de tarefa;
@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
// Exporta a classe para ser usando em outro component;
export class TaskComponent {
  @Input() task: Task | null = null;
  @Output() edit = new EventEmitter<Task>();
}
