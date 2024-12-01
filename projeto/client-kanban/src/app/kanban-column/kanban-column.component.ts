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
    let mutableTasks = [...this.column.tasks];

    if (event.previousContainer === event.container) {
      moveItemInArray(mutableTasks, event.previousIndex, event.currentIndex);

      mutableTasks = mutableTasks.map((task, i) => ({
        description: task.description,
        id: Number(task.id),
        sequence: i + 1,
        id_column: Number(task.id_column),
        deleted: task.deleted,
      }))

      this.column = { ...this.column, tasks: mutableTasks };

      this.updateTaskSequence()

      return
    } else {
      const previousTasks = [...event.previousContainer.data];
      const currentTasks = [...event.container.data];

      transferArrayItem(previousTasks, currentTasks, event.previousIndex, event.currentIndex);

      const movedTask = { ...currentTasks[event.currentIndex] };

      movedTask.id_column = this.column.id;

      this.column = {
        ...this.column, tasks: currentTasks.map((task) =>
          task.id === movedTask.id ? movedTask : task
        )
      };

      this.kanbanService.moveTask(
        Number(event.previousContainer.id.split('-')[1]),
        this.column.id,
        movedTask,
        event.currentIndex,
      );
    }
  }


  async updateTaskSequence() {
    await this.taskService.manyUpdateTask(this.column.tasks)

    this.kanbanService.notifyRefreshColumns();
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
