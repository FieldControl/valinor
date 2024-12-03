import { Component, computed } from '@angular/core';
import { BoardComponent } from './components/board/board.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskService } from './services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent, TaskFormComponent, CommonModule],
  template: `
    <div class="bg-gray-950 min-h-screen h-full w-full py-20 px-6 md:px-0 text-gray-50 antialiased flex flex-col items-center justify-center">
      <div class="container w-full mt-10">
        <h1 class="text-center font-semibold text-4xl">Kanban</h1>
        <app-task-form class=""></app-task-form>
      </div>
      <app-board class="container flex-1"></app-board>
    </div>
  `,
})
export class AppComponent {
  hasTasks = computed(() => {
    const allTasks = [
      ...this.taskService.tasksInProcess(),
      ...this.taskService.tasksFinalized(),
    ];
    return allTasks.length > 0;
  });

  constructor(private taskService: TaskService) {}
}
