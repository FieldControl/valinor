import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { CREATE_BOARD, UPDATE_BOARD, REMOVE_BOARD } from '../../data-access/board.mutations';
import { GET_BOARDS } from '../../data-access/board.queries';

export type ModalMode = 'create' | 'edit' | 'remove';

@Component({
  selector: 'app-board-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './board-modal.html',
  styleUrl: './board-modal.css',
})
export class BoardModal implements OnInit{
  @Input() mode: ModalMode = 'create';
  @Input() boardData?: { id: number, title: string };

  @Output() closeBoardModal = new EventEmitter<void>();
  @Output() savedBoardModal = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]]
  });

  isSubmitting = false;

  ngOnInit() {
    if (this.mode === 'edit' && this.boardData) {
      this.form.patchValue({ title: this.boardData.title });
    }
  }

  submit() {
    if (this.mode !== 'remove' && this.form.invalid) return;
    this.isSubmitting = true;

    let mutation: any;
    let variables: any;

    if (this.mode === 'create') {
      mutation = CREATE_BOARD;
      variables = { 
        createBoardInput: { 
          title: this.form.value.title 
        } 
      };

    } else if (this.mode === 'edit') {
      mutation = UPDATE_BOARD;
      variables = { 
        updateBoardInput: { 
          id: this.boardData?.id, 
          title: this.form.value.title 
        } 
      };

    } else if (this.mode === 'remove') {
      mutation = REMOVE_BOARD;
      variables = { id: this.boardData?.id };

    }

    this.apollo.mutate({
      mutation,
      variables,
      refetchQueries: [{ query: GET_BOARDS }]
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.savedBoardModal.emit();
        this.closeBoardModal.emit();
      },
      error: (err) => {
        console.error('Erro Board:', err);
        this.isSubmitting = false;
      }
    });
  }
}
