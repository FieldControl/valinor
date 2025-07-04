import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StatusTarefa, Task } from './interface/task';
import { TaskDialogComponent } from './component/task-dialog/task-dialog.component';
import { TaskDialogResult } from './interface/task-dia-log-result';
import { TaskService } from './service/task.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private _dialog: MatDialog, private _snackBar: MatSnackBar, private _taskService: TaskService) { }
  ngOnInit(): void {

  }



  title = 'kanban';
  // Itens do kanban
  todo: Task[] = [];

  inProgress: Task[] = [];

  done: Task[] = [];

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this._dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult | undefined) => {
        if (!result) {
          return;
        }
        const dataList = this[list];
        const taskIndex = dataList.indexOf(task);
        if (result.delete) {
          this._taskService.deleteTask(task.id).subscribe(() => {
            dataList.splice(taskIndex, 1);
          });
        } else {
          this._taskService.updateTask(task.id, result.task).subscribe((tarefaAtualizada) => {
            dataList[taskIndex] = tarefaAtualizada;
          });
        }
      });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      return;
    }

    const movedTask = event.previousContainer.data[event.previousIndex];
    const newList = event.container.id;

    let newStatus: StatusTarefa;
    if (newList === 'todoList') newStatus = StatusTarefa.PENDENTE;
    else if (newList === 'inProgressList') newStatus = StatusTarefa.EM_ANDAMENTO;
    else newStatus = StatusTarefa.CONCLUIDA;

    this._taskService.updateTask(movedTask.id, { status: newStatus }).subscribe(() => {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    });
  }


  newTask(): void {
  const dialogRef = this._dialog.open(TaskDialogComponent, {
    width: '400px',
    data: {
      task: {},
    },
  });

  dialogRef.afterClosed().subscribe((result: TaskDialogResult | undefined) => {
    if (!result) return;

    this._taskService.createTask({
      ...result.task,
      status: StatusTarefa.PENDENTE, // garante que será salvo corretamente
    }).subscribe((novaTarefa: any) => {
      this.todo.push(novaTarefa); // adiciona no backlog

      // ✅ Notificação de sucesso
      this._snackBar.open('Tarefa criada com sucesso!', 'Fechar', {
        duration: 3000,
      });
    });
  });
}



}
