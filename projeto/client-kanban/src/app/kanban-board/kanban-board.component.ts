import { Component, OnInit } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanService } from '../services/kanban.service';
import { ColumnService } from '../services/column.service';
import { Column } from '../shared/models/column';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [KanbanColumnComponent, CommonModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
})
export class KanbanBoardComponent implements OnInit {
  columns: Column[] = [];
  connectedLists: string[] = [];

  constructor(
    private columnService: ColumnService,
    private kanbanService: KanbanService
  ) { }

  ngOnInit(): void {
    this.fetchColumns();

    this.kanbanService.refreshColumns$.subscribe(() => {
      this.fetchColumns();
    });

    this.kanbanService.moveTask$.subscribe(({ fromColumnId, toColumnId, task, currentIndex }) => {
      this.handleTaskMovement(fromColumnId, toColumnId, task, currentIndex);
    });
  }

  fetchColumns(): void {
    this.columnService.getColumns().then(({ data }: any) => {
      this.columns = data.columns;

      this.connectedLists = this.columns.map((col) => `list-${col.id}`);
    });
  }

  async handleTaskMovement(fromColumnId: number, toColumnId: number, task: any, targetIndex: number) {
    const mutableColumns = this.columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    const fromColumn = mutableColumns.find((col) => Number(col.id) === fromColumnId);

    if (fromColumn) {
      fromColumn.tasks = fromColumn.tasks.filter((t: any) => t.id !== task.id);
    }

    const toColumn = mutableColumns.find((col) => Number(col.id) === Number(toColumnId));

    if (toColumn) {
      const updatedTasks = [...toColumn.tasks];
      updatedTasks.splice(targetIndex, 0, task);
      toColumn.tasks = updatedTasks;
    }

    this.columns = mutableColumns;

    const columnsUpdated = mutableColumns
      .filter(col => Number(col.id) === Number(fromColumnId) || Number(col.id) === Number(toColumnId))
      .map(col => ({
        id: Number(col.id),
        description: col.description,
        sequence: col.sequence,
        tasks: col.tasks.map((t, i) => ({
          id: Number(t.id),
          id_column: Number(col.id),
          description: t.description,
          sequence: i + 1,
          deleted: t.deleted,
        })),
      }));

    await this.columnService.manyUpdateColumn(columnsUpdated)

    this.kanbanService.notifyRefreshColumns()
  }
}