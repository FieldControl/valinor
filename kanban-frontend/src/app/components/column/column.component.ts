import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DemoNgZorroAntdModule } from '../../shared/utils/DemoNgZorroAntdModules';
import { CardComponent } from '../card/card.component';
import { Column } from './column.interface';
import { AddButtonComponent } from '../../shared/add.button/add.button.component';
import { GET_ALL_COLUMNS } from '../../shared/queries/column.queries';
import { GraphqlService } from '../../shared/graphql/graphql.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AddColumnModalComponent } from '../../shared/add-column-modal/add-column-modal.component';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [
    CommonModule,
    DemoNgZorroAntdModule,
    CardComponent,
    AddButtonComponent,
    DragDropModule
  ],
  templateUrl: './column.component.html',
  styleUrl: './column.component.scss'
})
export class ColumnComponent {
  @Input() boardId: number | undefined;
  columns: Column[] = [];
  loading = true;
  error: any;

  constructor(private graphqlService: GraphqlService, private modalService: NzModalService) {}

  ngOnInit(): void {
    this.graphqlService.query(GET_ALL_COLUMNS).subscribe({
      next: (result) => {
        this.columns = result.data.getAllColumns
        .filter((column: { boardId: any; }) => column.boardId === this.boardId)
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      },
    });
  }

  showErrorModal(errorMessage: string): void {
    this.modalService.create({
      nzTitle: 'Erro',
      nzContent: errorMessage,
      nzClosable: true,
      nzFooter: null,
    })
  }

  openEditTaskModal(column: Column): void {
    const modalRef: NzModalRef<AddColumnModalComponent> = this.modalService.create({
      nzTitle: 'Editar Tarefa',
      nzContent: AddColumnModalComponent,
      nzFooter: null
    });
    modalRef.componentInstance!.column = column;
  }

  deleteColumn(columnId: number | undefined) {
    const GET_ALL_CARDS_QUERY = `
      query GetAllCards {
        getAllCards {
          id
          columnId
        }
      }
    `;
  
    this.graphqlService.query(GET_ALL_CARDS_QUERY).subscribe({
      next: (result) => {
        const cards = result.data.getAllCards;
        const hasCardsAttached = cards.some((card: { columnId: number; }) => card.columnId === columnId);
  
        if (hasCardsAttached) {
          this.showErrorModal('Há cards atrelados à esta coluna, não foi possível deletar');
          return;
        }
        const DELETE_COLUMN_MUTATION = `
          mutation DeleteColumn($id: Int!) {
            deleteColumn(id: $id)
          }
        `;
  
        this.graphqlService.mutate(DELETE_COLUMN_MUTATION, { id: columnId }).subscribe({
          next: (deleteResult) => {
            if (deleteResult.data.deleteColumn) {
              this.columns = this.columns.filter(column => column.id !== columnId);
            } else {
              this.showErrorModal('Falha ao deletar a coluna');
            }
          },
          error: (error) => {
            console.error('Erro ao realizar mutação de deleção:', error);
          },
        });
      },
      error: (error) => {
        console.error('Erro ao consultar os cards:', error);
      },
    });
  }
  
  updateColumnsPositions(): void {
    const UPDATE_COLUMNS_MUTATION = `
      mutation UpdateColumnPosition($columns: [UpdateColumnInput!]!) {
        updateColumnsPositions(columns: $columns) {
          id
          name
          position
        }
      }
    `;
    const columnsWithNewPositions = this.columns.map((column, index) => ({
      id: column.id,
      position: index
    }));
  
    this.graphqlService.mutate(UPDATE_COLUMNS_MUTATION, { columns: columnsWithNewPositions }).subscribe({
      next: (result) => {
        console.log('Posições atualizadas com sucesso:', result.data.updateColumnPosition);
      },
      error: (error) => {
        console.error('Erro ao atualizar posições das colunas:', error);
      }
    });
  }

  moveColumnList(fromIndex: number, toIndex: number): void {
    moveItemInArray(this.columns, fromIndex, toIndex)
    this.updateColumnsPositions()
  }

  moveList(dropEvent: CdkDragDrop<Column[]>): void {
    const { previousIndex, currentIndex } = dropEvent
    if(previousIndex === currentIndex) {
      return;
    }
    this.moveColumnList(previousIndex, currentIndex)
  }
}
