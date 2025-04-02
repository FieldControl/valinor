import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../task.model';

@Component({
  selector: 'app-excluir',
  imports: [],
  templateUrl: './excluir.component.html',
  styleUrl: './excluir.component.css'
})
export class ExcluirComponent implements OnInit {

  task!: Task

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ){}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    this.taskService.getTaskById(parseInt(id!)).subscribe(data => {
      this.task = data
    })
  }

  excluir(){
    if(this.task.id){
      this.taskService.deleteTask(this.task.id).subscribe(() => {
        this.router.navigate([''])
      })
    }
  }

  cancelar(){
    this.router.navigate([''])
  }
}
