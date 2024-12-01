import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Column } from '../shared/models/column';
import { TaskService } from '../services/task.service';
import { KanbanService } from '../services/kanban.service';
import { ColumnService } from '../services/column.service';
import { KanbanTaskComponent } from '../kanban-task/kanban-task.component';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-kanban-column',
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.css'],
  standalone: true,
  imports: [
    KanbanTaskComponent,
    CommonModule,
    DragDropModule, // Adicione esta linha
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
  ],
})
export class KanbanColumnComponent implements OnInit {
  @Input() column!: Column;
  @Input() connectedLists: string[] = []; // Listas conectadas
  value: string | undefined;
  id: number = 0;
  id_column: number = 0;
  visible: boolean = false;
  editTask: boolean = false;

  constructor(
    private columnService: ColumnService,
    private taskService: TaskService,
    private kanbanService: KanbanService
  ) { }

  ngOnInit(): void {
    this.kanbanService.editTask$.subscribe(({ id, description, id_column }) => {
      if (Number(this.column.id) === Number(id_column)) {
        this.visible = true;
        this.editTask = true;
        this.value = description;
        this.id = Number(id);
        this.id_column = Number(id_column);
      }
    });
  }

  onTaskDrop(event: CdkDragDrop<any[]>): void {
    const mutableTasks = [...this.column.tasks];

    if (event.previousContainer === event.container) {
      moveItemInArray(mutableTasks, event.previousIndex, event.currentIndex);

      this.column = { ...this.column, tasks: mutableTasks };

      this.updateTaskSequence()
    } else {
      // Criar cópias mutáveis dos arrays de origem e destino
      const previousTasks = [...event.previousContainer.data];
      const currentTasks = [...event.container.data];

      transferArrayItem(previousTasks, currentTasks, event.previousIndex, event.currentIndex);

      // Criar uma cópia mutável da tarefa
      const movedTask = { ...currentTasks[event.currentIndex] };

      // Atualizar a coluna da tarefa
      movedTask.id_column = this.column.id;

      // Atualizar o array de tarefas da coluna atual
      this.column = {
        ...this.column, tasks: currentTasks.map((task) =>
          task.id === movedTask.id ? movedTask : task
        )
      };

      console.log('previous tasks', this.column.id)

      // Notificar o KanbanService sobre a mudança
      this.kanbanService.moveTask(
        Number(event.previousContainer.id.split('-')[1]),
        this.column.id,                     // ID da coluna de destino
        movedTask,
        event.currentIndex,                    // Tarefa movida
      );
    }
  }


  updateTaskSequence(): void {
    // this.column.tasks.map((task, index) => {
    //   task.sequence = index + 1;
    // });

    console.log(this.column.tasks)

    // this.taskService.updateTasks(this.column.tasks).then(() => {
    //   this.kanbanService.notifyRefreshColumns();
    // });
  }

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.value = undefined;
    this.editTask = false;
    this.id = 0;
    this.id_column = 0;
    this.visible = false;
  }

  async handleSubmit() {
    if (!this.value) return;

    if (this.editTask) {
      await this.taskService.updateTask({
        description: this.value,
        id_column: Number(this.column.id),
        id: this.id,
      });
    } else {
      await this.taskService.createTask({
        description: this.value,
        id_column: Number(this.column.id),
      });
    }

    this.kanbanService.notifyRefreshColumns();

    this.hideDialog();
  }

  handleEdit() {
    this.kanbanService.editColumn(this.column.id, this.column.description);
  }

  async handleDelete() {
    await this.columnService.deleteColumn(Number(this.column.id));

    this.kanbanService.notifyRefreshColumns();
  }
}
