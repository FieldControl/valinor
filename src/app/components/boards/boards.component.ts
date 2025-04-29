import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-boards',
  imports: [],
  standalone: true,
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css'
})
export class BoardsComponent implements OnInit {
  allTasks: Task[] = [];
  todoTasks: Task[] = [];
  doingTasks: Task[] = [];
  finishedTasks: Task[] = [];

  constructor(private taskService: TaskService) { }

  // Carrega as tarefas em seus respectivos quadros 
  ngOnInit(): void {
    this.taskService.getTask().subscribe((tasks) => {
      this.allTasks = tasks;
      this.todoTasks = tasks.filter(task => task.status === 'ToDo');
      this.doingTasks = tasks.filter(task => task.status === 'Doing');
      this.finishedTasks = tasks.filter(task => task.status === 'Finished');
    });
  }
}
