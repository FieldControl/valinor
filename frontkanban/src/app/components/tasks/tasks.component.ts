import { Component, EventEmitter, Input, Output } from '@angular/core';
import {AccordionPanel, Accordion, AccordionHeader, AccordionContent } from 'primeng/accordion';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ChangeDetectorRef } from '@angular/core';
import { TaskModule } from '../../modules/task/task.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditTaskComponent } from "../edit-task/edit-task.component";



@Component({
  selector: 'app-tasks',
  imports: [AccordionPanel, Accordion, AccordionHeader, AccordionContent, FontAwesomeModule, EditTaskComponent],
  standalone: true,
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css',
})
export class TasksComponent {
  @Input() tasks: TaskModule[] = [];
  @Output() taskDeleted = new EventEmitter<TaskModule>();
  @Output() taskEdited = new EventEmitter<TaskModule>();
  @Output() statusChanged = new EventEmitter<{ task: TaskModule, newStatus: number }>();

  faPencil = faPencil;
  faTrash = faTrash;
  faPlus = faPlus;

  constructor(private cd: ChangeDetectorRef) { }


  deleteTask(task: TaskModule) {
    this.taskDeleted.emit(task);
  }

  onTaskEdited(task: TaskModule) {
    this.taskEdited.emit(task);
  }


  changeStatus(task: TaskModule, newStatus: number) {
    this.statusChanged.emit({ task, newStatus });
  }
  class: string = "w-full h-full mt-6"
  style = {
    'background-color': '#fff',
    'color': '#000',
    'text-align': 'center',
    'font-family': 'sans-serif',
  }
}
