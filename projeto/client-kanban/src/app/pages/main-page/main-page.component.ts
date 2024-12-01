import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { KanbanBoardComponent } from '../../kanban-board/kanban-board.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { ColumnService } from '../../services/column.service';
import { KanbanColumnComponent } from '../../kanban-column/kanban-column.component';
import { KanbanService } from '../../services/kanban.service';

@Component({
  selector: 'app-main-page',
  imports: [
    KanbanBoardComponent,
    DialogModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent {
  value: string | undefined;
  visible: boolean = false;

  constructor(
    private columnService: ColumnService,
    private kanbanService: KanbanService
  ) {}

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
    this.value = undefined;
  }

  handleSubmit() {
    if (!this.value) return;

    this.columnService.createColumn({ description: this.value }).then(() => {
      this.kanbanService.notifyRefreshColumns();
    })

    this.hideDialog();
  }
}