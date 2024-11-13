import { Component, Input } from '@angular/core';
import { GraphqlService } from '../graphql/graphql.service';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GET_ALL_COLUMNS } from '../queries/column.queries';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../utils/DemoNgZorroAntdModules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Column } from '../../components/column/column.interface';

@Component({
  selector: 'app-add-column-modal',
  standalone: true,
  imports: [
    CommonModule,
    DemoNgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-column-modal.component.html',
  styleUrl: './add-column-modal.component.scss'
})
export class AddColumnModalComponent {
  @Input() column!: Column;
  boardId: number = 4;
  name?: string = '';
  position: number = 1;

  constructor(private modalRef: NzModalRef, private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    if (this.column) {
      this.name = this.column.name;
    } else {
      this.graphqlService.query(GET_ALL_COLUMNS, { boardId: this.boardId })
      .subscribe({
        next: (result) => {
          const columns = result.data.getAllColumns || [];
          const filteredColumns = columns.filter((column: { boardId: number; }) => column.boardId === this.boardId)
          const positions = filteredColumns.map((column: any) => column.position);
          this.position = positions.length ? Math.max(...positions) + 1 : 1;
        },
        error: (error) => {
          console.error('Erro ao obter posição:', error);
        }
      });
    }
  }

  submitForm() {
    if (this.column) {
      const UPDATE_COLUMN_MUTATION = `
        mutation UpdateColumn($id: Int!, $data: UpdateColumnInput!) {
          updateColumn(id: $id, data: $data) {
            name
          }
        }
      `;

      const updatedColumn = {
        name: this.name,
      };

      this.graphqlService.mutate(UPDATE_COLUMN_MUTATION, { id: this.column.id, data: updatedColumn }).subscribe({
        next: (result: { data: { updateColumn: any; }; }) => {
          window.location.reload();
          this.modalRef.destroy(result.data.updateColumn);
        },
        error: (error: any) => {
          console.error('Erro ao editar coluna:', error);
        }
      });
    } else {
      const CREATE_COLUMN_MUTATION = `
        mutation CreateColumn($data: CreateColumnInput!) {
          createColumn(data: $data) {
            id
            name
            position
          }
        }
      `;
          
      const newColumn = {
        name: this.name,
        boardId: this.boardId,
        position: this.position
      };
      
      this.graphqlService.mutate(CREATE_COLUMN_MUTATION, { data: newColumn })
      .subscribe({
        next: (result: { data: { createColumn: any; }; }) => {
            window.location.reload();
            this.modalRef.destroy(result.data.createColumn);
          },
          error: (error: any) => {
            console.error('Erro ao criar tarefa:', error);
          }
        });
    }
  }
}
