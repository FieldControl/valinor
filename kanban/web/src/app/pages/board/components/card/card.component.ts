import { Component, Input } from '@angular/core';
import { ApiServiceService, Task } from 'src/app/core/api/api-service.service';
import { BoardService } from '../../board.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input({ required: true }) task!: Task;

  constructor(
    private apiService: ApiServiceService,
    private boardService: BoardService
  ) {}

  deleteTask(taskId: string) {
    this.apiService.deleteTask(taskId).subscribe(() => {
      this.boardService.search$.next();
    });
  }
}
