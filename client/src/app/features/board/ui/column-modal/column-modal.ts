import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { CREATE_COLUMN, UPDATE_COLUMN, REMOVE_COLUMN } from '../../data-access/column.mutations';
import { GET_BOARD_BY_ID } from '../../data-access/board.queries';

export type ModalMode = 'create' | 'edit' | 'remove';

@Component({
  selector: 'app-column-creation-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './column-modal.html',
  styleUrl: './column-modal.css',
})
export class ColumnModal {
  @Input({ required: true }) boardId!: number;
  @Input() mode: ModalMode = 'create';
  @Input() columnData?: { id: number, title: string };
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() savedModal = new EventEmitter<void>();
  @Output() columnCreated = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);

  form = this.fb.group({
    title: ['', [Validators.required]]
  });

  isSubmitting = false;

  ngOnInit() {
    if (this.mode === 'edit' && this.columnData) {
      this.form.patchValue({ title: this.columnData.title });
    }
  }

  // Função responsável pelo CRUD das columns
  submit() {
    if (this.mode !== 'remove' && this.form.invalid) return;

    this.isSubmitting = true;
    let mutation: any;
    let variables: any;

    if (this.mode === 'create') {
      // Chama a mutation de criar novas colunas
      mutation = CREATE_COLUMN;
      variables = { 
        createColumnInput: {
          boardId: this.boardId,
          title: this.form.value.title
        } 
      };

    } else if (this.mode === 'edit') {
      //Chama a mutation de atualizar a colunas desejada
      mutation = UPDATE_COLUMN;
      variables = {
        updateColumnInput: {
          id: this.columnData?.id,
          title: this.form.value.title
        }
      }

    } else if (this.mode === 'remove') {
      //Chama a mutation para arquivar a coluna desejada
      mutation = REMOVE_COLUMN;
      variables = { id: this.columnData?.id };

    }

    if (!mutation) return;

    // Popula a pagina BoardDetails
    this.apollo.mutate({
      mutation,
      variables,
      refetchQueries: [
        {
          query: GET_BOARD_BY_ID,
          variables: {
            id: this.boardId
          }
        }
      ] 
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.form.reset();
        this.columnCreated.emit();
        this.savedModal.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        console.error('Erro ao criar coluna', err);
        this.isSubmitting = false;
      }
    });
  }

}
