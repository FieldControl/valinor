import { Component, Input } from '@angular/core';
import { Column } from '../../components/column/column.interface';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../utils/DemoNgZorroAntdModules';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AddTaskModalComponent } from '../add-task-modal/add-task-modal.component';
import { AddColumnModalComponent } from '../add-column-modal/add-column-modal.component';

@Component({
  selector: 'app-add-button',
  standalone: true,
  templateUrl: './add.button.component.html',
  imports: [CommonModule, DemoNgZorroAntdModule],
})
export class AddButtonComponent {
  @Input() column?: Column;
  @Input() label: string = '';

  constructor(private modalService: NzModalService) {}

  private openAddTaskModal(): void {
    const modalRef: NzModalRef<AddTaskModalComponent> = this.modalService.create({
      nzTitle: 'Adicionar Tarefa',
      nzContent: AddTaskModalComponent,
      nzFooter: null,
    });

    modalRef.afterOpen.subscribe(() => {
      const instance = modalRef.getContentComponent();
      if (instance && this.column?.id !== undefined) {
        instance.columnId = this.column?.id;
      }
    });
  }

  private openAddColumnModal(): void {
    this.modalService.create({
      nzTitle: 'Adicionar Coluna',
      nzContent: AddColumnModalComponent,
      nzFooter: null,
    });
  }

  openAddModal(label: string): void {
    if (label === 'Tarefa') {
      this.openAddTaskModal();
    } else {
      this.openAddColumnModal();
    }
  }
}
