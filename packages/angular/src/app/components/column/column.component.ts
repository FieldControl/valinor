import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskCardComponent } from '../task-card/task-card.component';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Task } from '../../models/kanban.model';

@Component({
  selector: 'app-column',
  standalone: true,
  templateUrl: './column.component.html',
  styleUrl: './column.component.css',
  imports: [MatIconModule, TaskCardComponent],
})
export class ColumnComponent implements OnInit {
  tasks!: Task[];
  @Input() title: string = '';
  @Input() projectId!: string;
  @Input() columnId!: string;
  @Output() clickEventTask = new EventEmitter<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllTasks(this.projectId, this.columnId).subscribe((data) => (this.tasks = data));
  }

  sendEventEmitNewTask() {
    this.clickEventTask.emit();
  }
}
