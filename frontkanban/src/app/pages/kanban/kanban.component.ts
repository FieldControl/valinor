import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Card } from 'primeng/card';
import { UserModule } from '../../modules/user/user.module';
import { TaskModule } from '../../modules/task/task.module';
import { HeaderKanbanComponent } from "../../components/header-kanban/header-kanban.component";
import { TasksComponent } from "../../components/tasks/tasks.component";
import {  faPlus} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AddTasksComponent } from "../../components/add-tasks/add-tasks.component";
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';



@Component({
  selector: 'app-kanban',
  imports: [Card, HeaderKanbanComponent, TasksComponent, FontAwesomeModule, AddTasksComponent],
  providers: [],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.css'
})
export class KanbanComponent implements OnInit {
  faSignOutAlt = faArrowRightFromBracket;
  faPlus = faPlus;
  taskModule: TaskModule = new TaskModule()
  auth?: UserModule;
  name?: string
  tasks: void | TaskModule[] = [];
  class: string = "w-full h-full mt-6"
  router: Router = new Router();
  style = {
    'background-color': '#fff',
    'color': '#000',
    'text-align': 'center',
    'font-family': 'sans-serif',
  }

  constructor(private cd: ChangeDetectorRef) { }
  async ngOnInit() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userJson = JSON.parse(storedUser);
      const user = new UserModule(userJson.id, userJson.name, userJson.email, userJson.password);
      this.auth = user;
      this.name = this.auth ? this.auth.name : '';
      this.loadTasks();
    }
  }
  async loadTasks() {
    if (this.auth) {
      this.tasks = await this.auth.getTasksForUser(String(this.auth.id));
    }
  }
  onTaskCreated(newTask: TaskModule) {
    this.tasks = [...this.tasks ? this.tasks : [], newTask];
    this.cd.detectChanges();
  }

  onTaskEdited(updatedTask: TaskModule) {
    this.taskModule.putTask(updatedTask)
  
    if (this.tasks) {
      const index = this.tasks.findIndex(task =>
        task.id === updatedTask.id ? updatedTask : task
      );
      this.tasks = this.tasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      );
    }
    this.cd.detectChanges();
  }

  deleteTask(taskToDelete: TaskModule) {
    if (this.tasks) { 
      this.tasks = this.tasks.filter(task => task.id !== taskToDelete.id); 
      this.taskModule.deleteTask(taskToDelete.id)
    }
    this.cd.detectChanges();
  }

  changeStatus(task: TaskModule, newStatus: number) {
    const updatedTask: TaskModule = new TaskModule(
      task.id,
      task.title,
      task.description,
      task.userId,
      newStatus,
      task.data
    )
    this.onTaskEdited(updatedTask);
  }
  async logout() {
    console.log('Logging out...');
    await this.router.navigate(['/']);
    console.log('Logged out.');
    localStorage.removeItem('user'); 
  }

  get tasksToDo(): TaskModule[] {
    if (this.tasks) { return this.tasks.filter(task => task.status === 1); }
    return []
  }

  get tasksInProcess(): TaskModule[] {
    if (this.tasks) { return this.tasks.filter(task => task.status === 2); }
    return []
  }

  get tasksDone(): TaskModule[] {
    if (this.tasks) { return this.tasks.filter(task => task.status === 3); }
    return []
  }
}
