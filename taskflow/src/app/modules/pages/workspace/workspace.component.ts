import { Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../interface/task.interface';
import { HeaderComponent } from "../../components/header/header.component";
import { TaskComponent } from "../../components/task/task.component";
import { DialogAddTaskComponent } from "../../components/dialog/dialog-add-task/dialog-add-task.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginResponse } from '../../interface/login-response.interface';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { TaskService } from '../../service/task.service';
import {FindAllUserTasksResponse } from '../../interface/find-all-user-task-response.interface';



@Component({
  selector: 'app-workspace',
  imports: [HeaderComponent, MatDialogModule, TaskComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})

export class WorkspaceComponent {
  public user: LoginResponse |null = null;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  public toDoTasks: Task[] = [];
  public inProgressTasks: Task[] = [];
  public doneTasks: Task[] = [];
  public service= new TaskService;
  
  #dialog = inject(MatDialog);
 
    public openDialog(){
      const dialogRef = this.#dialog.open(DialogAddTaskComponent,{
        width:'600px'
      })
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadTasks(); 
        }
      });
    }
    constructor(private authService: AuthService, private router: Router) {
      this.user = this.authService.getUser();
      this.loadTasks(); 
      this.observeTasks();
    }
    
    public async loadTasks() {
      if(this.user){
        const tasks = await this.service.getTasks(this.user.login._id as string) as FindAllUserTasksResponse | undefined ;
        if (tasks) {
          this.tasksSubject.next(tasks.findAllUserTasks as Task []);
        }else{
          this.tasksSubject.next([])
        }
      }else{
        this.router.navigate(['/'])
      }
      
    }
  
  
  

  private observeTasks(): void {
    this.tasks$.subscribe(tasks => {
      this.toDoTasks = [];
      this.inProgressTasks = [];
      this.doneTasks = [];

      tasks.sort((a, b) => b.priorityLevel - a.priorityLevel);
      tasks.forEach(task => {
        switch (task.status) {
          case 'In Progress':
            this.inProgressTasks.push(task);
            break;
          case 'To-do':
            this.toDoTasks.push(task);
            break;
          case 'Done':
            this.doneTasks.push(task);
            break;
          default:
            console.warn(`Status desconhecido: ${task.status}`);
        }
      });
    });
  }

  
  public updateTasks(newTasks: Task[]): void {
    this.tasksSubject.next(newTasks);
  }
  
  public first(){
    return this.user?.login.name.charAt(0).toUpperCase()
  }
}