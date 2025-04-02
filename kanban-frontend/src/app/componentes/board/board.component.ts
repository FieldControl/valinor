import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../task.model';



@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit{

  tasks: Task[] = []

  constructor(
    private router: Router,
    private taskService: TaskService
  ){}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe(data =>{
      this.tasks = data
    })
  }

  formNewCard(){
    this.router.navigate(['/task/new'])
  }

  filterTasks(status: string){
    return this.tasks.filter(task => task.status === status)
  }

}
