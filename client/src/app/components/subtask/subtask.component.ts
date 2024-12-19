import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtaskService } from '../../services/subtask.service';

@Component({
  selector: 'app-subtask',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subtask.component.html',
  styleUrl: './subtask.component.css',
})
export class SubtaskComponent {
  @Input() name: string = '';
  @Input() id: string = '';
  @Input() task: string = '';
  @Input() isCompleted: boolean = false;

  constructor(private subtaskService: SubtaskService) {}

  // Função para lidar com a mudança do checkbox
  onCheckboxClick(event: any) {
  
    // Desabilita o checkbox enquanto a atualização está sendo feita
  
    this.isCompleted = event.target.checked;
  
    // Chama o serviço para atualizar o status da subtarefa
    this.subtaskService
      .updateSubtask(this.id, this.isCompleted, this.task)
      .subscribe({
        next: () => {
          console.log('Subtarefa atualizada');
        },
        error: () => {
          console.log('Erro ao atualizar subtarefa');
        }
      });
  }

  deleteSubtask() {
    this.subtaskService.deleteSubtask(this.id, this.task).subscribe({
      next: () => {
        console.log('Subtarefa deletada');
      },
      error: () => {
        console.log('Erro ao deletar subtarefa');
      },
    });
  }
}
