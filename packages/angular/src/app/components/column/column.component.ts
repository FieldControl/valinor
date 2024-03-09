import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Task } from '../../models/kanban.model';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KanbanBoardComponent } from '../kanban-board/kanban-board.component';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
  imports: [MatIconModule, TaskCardComponent, ButtonComponent, ModalComponent, ReactiveFormsModule, CdkDropListGroup, CdkDrag, CdkDropList],
})
export class ColumnComponent implements OnInit {

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
  }


  @Input() title: string = '';
  @Input() projectId!: string;
  @Input() columnId!: string;
  @Output() update = new EventEmitter<void>();
  tasks!: Task[];
  editColumnTitle = new FormControl('');
  modal: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllTasks(this.projectId, this.columnId).subscribe((data) => (this.tasks = data));
  }

  createTask() {
    this.apiService.createTask(this.projectId, this.columnId, 'New task', 'description').subscribe((res) => {
      console.log('task criada', res);
      this.apiService.getAllTasks(this.projectId, this.columnId).subscribe((data) => (this.tasks = data));
    });
  }

  renameColumn() {
    const title = this.editColumnTitle.value;
    this.apiService.updateColumnTitle(this.columnId, title).subscribe((data) => {
      console.log('Renomeado');
      this.updateTest();
    });
    this.openCloseModal();
  }

  deleteColumn() {
    this.apiService.deleteColumn(this.columnId).subscribe((res) => {
      console.log('coluna deletada', res);
      this.updateTest();
    });
    this.openCloseModal();
  }

  openCloseModal() {
    this.modal = !this.modal;
  }

  updateTest() {
    this.update.emit();
  }

  updateTasks() {
    this.apiService.getAllTasks(this.projectId, this.columnId).subscribe((data) => (this.tasks = data));
  }
}
