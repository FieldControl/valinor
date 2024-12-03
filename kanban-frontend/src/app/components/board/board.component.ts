import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit {
  tasksInProcess = computed(() => this.taskService.tasksInProcess());
  tasksFinalized = computed(() => this.taskService.tasksFinalized());

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.loadTasks();
  }

  finishTask(id: string) {
    this.taskService.finishTask(id);
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id);
  }

  revertTaskToInProcess(id: string) {
    this.taskService.revertTaskToInProcess(id);
  }
}
