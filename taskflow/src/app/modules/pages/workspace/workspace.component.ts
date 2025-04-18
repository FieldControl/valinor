import { Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../interface/task.interface';
import { HeaderComponent } from "../../components/header/header.component";
import { TaskComponent } from "../../components/task/task.component";
import { DialogAddTaskComponent } from "../../components/dialog/dialog-add-task/dialog-add-task.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginResponse } from '../../interface/login-response.interface';
import { AuthService } from '../../../auth.service';
import { gql, GraphQLClient } from 'graphql-request';

interface FindAllUserTaskResponse {
  findAllUserTask: Task[];
}
@Component({
  selector: 'app-workspace',
  imports: [HeaderComponent, MatDialogModule, TaskComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})

export class WorkspaceComponent {
  public user: LoginResponse;
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  public toDoTasks: Task[] = [];
  public inProgressTasks: Task[] = [];
  public doneTasks: Task[] = [];
  public graphQlClient: GraphQLClient;
  #dialog = inject(MatDialog);
 
    public openDialog(){
      this.#dialog.open(DialogAddTaskComponent,{
        width:'600px'
      })
    }
    constructor(private authService: AuthService) {
      const apiUrl =
      (import.meta as any).env.VITE_API_URL || 'http://localhost:3333/api';
      this.graphQlClient = new GraphQLClient(apiUrl);
      this.user = this.authService.getUser();
      this.loadTasks(); 
      this.observeTasks();
    }
    
    private async loadTasks() {
      const tasks = await this.takeTasks(this.user);
      if (tasks) {
        this.tasksSubject.next(tasks.findAllUserTask);
      }else{
        this.tasksSubject.next([])
      }
    }
  
  
  private async takeTasks(user:LoginResponse){
    console.log('JORGE', user)
      const userId = user.login._id
      
      const query = gql`
        query FindAllUserTasks($userId: String!){
          findAllUserTasks(userId: $userId){
            _id
            userId
            title
            description
            status
            priorityLevel
            initDate
            endDate
          }
        }
      
      `
      try{
        const response:FindAllUserTaskResponse = await this.graphQlClient.request(query,
          {userId}
        )
        console.log('tesks encontradas', response)
        return response;
      }catch(error){
        console.error('Erro ao encontrar tasks ', error)
        return;
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