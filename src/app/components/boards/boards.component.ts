import { Component, OnInit } from '@angular/core';
import { TaskService, Task } from '../../services/task.service';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-boards',
  imports: [MatIconModule, MatDividerModule, MatButtonModule, MatMenuModule],
  standalone: true,
  templateUrl: './boards.component.html',
  styleUrl: './boards.component.css'
})

export class BoardsComponent implements OnInit {
  todoTasks: Task[] = []; // array que armazena tarefas com status = "ToDo"
  doingTasks: Task[] = []; // array que armazena tarefas com status = "Doing"
  finishedTasks: Task[] = []; // array que armazena tarefas com status = "Finished"

  // Importando o service Task
  constructor(private taskService: TaskService) { }

  // Carrega as tarefas em seus respectivos quadros 
  ngOnInit(): void {
    this.taskService.getTask().subscribe((tasks) => {
      this.taskService.allTasks = tasks;
      this.todoTasks = tasks.filter(task => task.status === 'ToDo');
      this.doingTasks = tasks.filter(task => task.status === 'Doing');
      this.finishedTasks = tasks.filter(task => task.status === 'Finished');
    });
  }

  // Função para deletar tarefa
  deleteTask(id: string): void {
    this.taskService.deleteTask(id);
  }

  // Função para mover tarefa para outro quadro 
  moveTask(id: string, newStatus:string){
    this.taskService.moveTask(id, newStatus);
  }
}
