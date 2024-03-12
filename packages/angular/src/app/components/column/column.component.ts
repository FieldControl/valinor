import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Task } from '../../models/kanban.model';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
  imports: [MatIconModule, TaskCardComponent, ButtonComponent, ModalComponent, ReactiveFormsModule, DragDropModule],
})
export class ColumnComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() projectId!: string;
  @Input() columnId!: string;
  @Output() updateColumnsEmit = new EventEmitter<void>();
  editColumnTitle = new FormControl('', { nonNullable: true });
  tasks!: Task[];
  openModal: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.getAllTasks(this.projectId, this.columnId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      this.getAllTasks(this.projectId, this.columnId);
    }
  }

  getAllTasks(projectId: string, columnId: string) {
    this.apiService.getAllTasks(projectId, columnId).subscribe((taskData) => {
      if ('message' in taskData && 'code' in taskData) {
        return (this.tasks = []);
      }
      return (this.tasks = taskData);
    });
  }

  renameColumn() {
    const title = this.editColumnTitle.value;
    this.apiService.updateColumnTitle(this.columnId, title).subscribe(() => {
      this.updateColumns();
    });
    this.openCloseModal();
  }

  deleteColumn() {
    this.apiService.deleteColumn(this.columnId).subscribe(() => {
      this.updateColumns();
    });
    this.openCloseModal();
  }

  createTask() {
    this.apiService.createTask(this.projectId, this.columnId, 'New task', 'description').subscribe(() => {
      this.getAllTasks(this.projectId, this.columnId);
    });
  }

  openCloseModal() {
    this.openModal = !this.openModal;
  }

  updateColumns() {
    this.updateColumnsEmit.emit();
  }

  updateTasks() {
    this.apiService.getAllTasks(this.projectId, this.columnId).subscribe((data) => (this.tasks = data));
  }

  drop(event: CdkDragDrop<Task[]>) {
    const cardId: string = event.item.data._id;
    const columnId: string = event.container.id
    this.apiService.moveTask(cardId, columnId).subscribe();
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
  }
}
