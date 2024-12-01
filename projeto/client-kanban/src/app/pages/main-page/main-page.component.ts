import { Component, OnInit } from '@angular/core';
import { KanbanBoardComponent } from '../../kanban-board/kanban-board.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { ColumnService } from '../../services/column.service';
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
export class MainPageComponent implements OnInit {
  value: string | undefined;
  id: number = 0;
  visible: boolean = false;
  editColumn: boolean = false;

  constructor(
    private columnService: ColumnService,
    private kanbanService: KanbanService
  ) { }

  ngOnInit(): void {
    this.kanbanService.editColumn$.subscribe(({ id, description }) => {
      this.visible = true
      this.editColumn = true
      this.value = description
      this.id = Number(id)
    });
  }

  showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.value = undefined;
    this.id = 0;
    this.editColumn = false;
    this.visible = false;
  }

  async handleSubmit() {
    if (!this.value) return;

    if (this.editColumn) {
      await this.columnService.updateColumn({ description: this.value, id: this.id })
    } else {
      await this.columnService.createColumn({ description: this.value })
    }

    this.kanbanService.notifyRefreshColumns();

    this.hideDialog();
  }
}