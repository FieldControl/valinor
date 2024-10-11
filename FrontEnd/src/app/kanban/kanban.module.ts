import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { KanbanDragHandleComponent } from './kanban-drag-handle/kanban-drag-handle.component';
import { KanbanListComponent } from './kanban-list/kanban-list.component';
import { KanbanListTasksWrapperComponent } from './kanban-list-tasks-wrapper/kanban-list-tasks-wrapper.component';
import { KanbanTaskComponent } from './kanban-task/kanban-task.component';
import { KanbanToolbarComponent } from './kanban-toolbar/kanban-toolbar.component';

@NgModule({
  declarations: [
    KanbanBoardComponent,
    KanbanListComponent,
    KanbanListTasksWrapperComponent,
    KanbanTaskComponent,
    KanbanDragHandleComponent,
    KanbanToolbarComponent,
  ],
  imports: [CommonModule, FormsModule, DragDropModule],
  exports: [KanbanBoardComponent],
})
export class KanbanModule {}
