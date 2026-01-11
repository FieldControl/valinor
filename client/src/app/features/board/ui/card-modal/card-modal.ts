import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';

import { CREATE_CARD, REMOVE_CARD, UPDATE_CARD } from '../../data-access/card.mutations';
import { GET_BOARD_BY_ID } from '../../data-access/board.queries';

export type ModalMode = 'create' | 'edit' | 'remove';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './card-modal.html',
  styleUrl: './card-modal.css',
})
export class CardModal {
  @Input({ required: true }) boardId!: number;
  @Input() columnId?: number;
  @Input() mode: ModalMode = 'create';
  @Input() cardData?: { id: number, title: string, desc?: string };

  @Output() closeModal = new EventEmitter<void>();
  @Output() savedModal = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    desc: ['']
  });

  isSubmitting = false;

  ngOnInit() {
    if (this.mode === 'edit' && this.cardData) {
      this.form.patchValue({
        title: this.cardData.title,
        desc: this.cardData.desc
      });
    }
  }

  submit() {
    if (this.mode !== 'remove' && this.form.invalid) return;
    this.isSubmitting = true;

    let mutation: any;
    let variables: any;

    if (this.mode === 'create') {
      mutation = CREATE_CARD;
      variables = {
        createCardInput: {
          title: this.form.value.title,
          desc: this.form.value.desc,
          columnId: this.columnId
        }
      };
    } else if (this.mode === 'edit') {
      mutation = UPDATE_CARD;
      variables = {
        updateCardInput: {
          id: this.cardData?.id,
          title: this.form.value.title,
          desc: this.form.value.desc
        }
      };
    } else if (this.mode === 'remove') {
      mutation = REMOVE_CARD;
      variables = { id: this.cardData?.id };
    }

    this.apollo.mutate({
      mutation,
      variables,
      refetchQueries: [{
        query: GET_BOARD_BY_ID,
        variables: { id: this.boardId }
      }]
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.savedModal.emit();
        this.closeModal.emit();
      },
      error: (err) => {
        console.error('Erro Card:', err);
        this.isSubmitting = false;
      }
    });
  }
}
