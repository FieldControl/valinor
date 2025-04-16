import { Component, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task } from '../../interface/task.interface';
import { HeaderComponent } from "../../components/header/header.component";
import { TaskComponent } from "../../components/task/task.component";
import { DialogAddTaskComponent } from "../../components/dialog/dialog-add-task/dialog-add-task.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-workspace',
  imports: [HeaderComponent, MatDialogModule, TaskComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss'
})
export class WorkspaceComponent {
  private tasksSubject = new BehaviorSubject<Task[]>([]); 
  public tasks$ = this.tasksSubject.asObservable(); 

  public toDoTasks: Task[] = [];
  public inProgressTasks: Task[] = [];
  public doneTasks: Task[] = [];
  #dialog = inject(MatDialog);
    public openDialog(){
      this.#dialog.open(DialogAddTaskComponent,{
        width:'600px'
      })
    }
  constructor() {
    this.tasksSubject.next(this.tasks); 
    this.observeTasks(); 
  }
  

  public tasks: Task[] = [
    {
      _id: '1',
      userId: '123',
      title: 'Finalizar relatório',
      description: 'Completar o relatório mensal de vendas.',
      status: 'In Progress',
      priorityLevel: 3,
      initDate: new Date('2025-04-10'),
      endDate: new Date('2025-04-15')
    },
    {
      _id: '2',
      userId: '124',
      title: 'Revisar código',
      description: 'Revisar o código do módulo de autenticação.',
      status: 'To-do',
      priorityLevel: 2,
      initDate: new Date('2025-04-12')
    },
    {
      _id: '3',
      userId: '125',
      title: 'Planejar reunião',
      description: 'Planejar a reunião de alinhamento com a equipe.',
      status: 'Done',
      priorityLevel: 1,
      initDate: new Date('2025-04-14'),
      endDate: new Date('2025-04-16')
    },
    {
      _id: '4',
      userId: '126',
      title: 'Criar apresentação',
      description: 'Preparar slides para a reunião de vendas.',
      status: 'In Progress',
      priorityLevel: 5,
      initDate: new Date('2025-04-15')
    },
    {
      _id: '5',
      userId: '127',
      title: 'Atualizar documentação',
      description: 'Revisar e atualizar a documentação do projeto.',
      status: 'To-do',
      priorityLevel: 3,
      initDate: new Date('2025-04-16'),
      endDate: new Date('2025-04-20')
    },
    {
      _id: '6',
      userId: '128',
      title: 'Testar funcionalidades',
      description: 'Executar testes no módulo de pagamentos.',
      status: 'Done',
      priorityLevel: 4,
      initDate: new Date('2025-04-17'),
      endDate: new Date('2025-04-18')
    },
    {
      _id: '7',
      userId: '129',
      title: 'Corrigir bugs',
      description: 'Resolver problemas relatados no sistema.',
      status: 'In Progress',
      priorityLevel: 5,
      initDate: new Date('2025-04-18')
    },
    {
      _id: '8',
      userId: '130',
      title: 'Planejar campanha',
      description: 'Definir estratégias para a nova campanha de marketing.',
      status: 'To-do',
      priorityLevel: 1,
      initDate: new Date('2025-04-19')
    },
    {
      _id: '9',
      userId: '131',
      title: 'Revisar contratos',
      description: 'Analisar contratos com fornecedores.',
      status: 'Done',
      priorityLevel: 2,
      initDate: new Date('2025-04-20'),
      endDate: new Date('2025-04-22')
    },
    {
      _id: '10',
      userId: '132',
      title: 'Configurar servidor',
      description: 'Configurar o novo servidor de produção.',
      status: 'In Progress',
      priorityLevel: 5,
      initDate: new Date('2025-04-21')
    },
    {
      _id: '11',
      userId: '133',
      title: 'Criar wireframes',
      description: 'Desenhar wireframes para o novo site.',
      status: 'To-do',
      priorityLevel: 3,
      initDate: new Date('2025-04-22'),
      endDate: new Date('2025-04-25')
    },
    {
      _id: '12',
      userId: '134',
      title: 'Realizar treinamento',
      description: 'Treinar a equipe sobre o novo sistema.',
      status: 'Done',
      priorityLevel: 5,
      initDate: new Date('2025-04-23'),
      endDate: new Date('2025-04-24')
    },
    {
      _id: '13',
      userId: '135',
      title: 'Escrever artigo',
      description: 'Escrever um artigo para o blog da empresa.',
      status: 'In Progress',
      priorityLevel: 1,
      initDate: new Date('2025-04-24')
    }
  ];

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
}