import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DemoNgZorroAntdModule } from '../utils/DemoNgZorroAntdModules';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GraphqlService } from '../graphql/graphql.service';
import { GET_ALL_CARDS } from '../queries/card.queries';
import { Card } from '../../components/card/card.interface';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [
    CommonModule,
    DemoNgZorroAntdModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss',
  animations: [
    trigger('modalContainer', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ opacity: 0 })),
      ])
    ])
  ]
})
export class AddTaskModalComponent {
  @Input() card!: Card;
  @Input() columnId!: number;
  name?: string = '';
  description?: string = '';
  position?: number = 1;

  constructor(private modalRef: NzModalRef, private graphqlService: GraphqlService) {}

  ngOnInit(): void {      
    if (this.card) {
      this.name = this.card.title;
      this.description = this.card.description;
      this.position = this.card.position;
    } else {
      this.graphqlService.query(GET_ALL_CARDS, { columnId: this.columnId })
      .subscribe({
        next: (result) => {
          const cards = result.data.getAllCards || [];
          const filteredCards = cards.filter((card: { columnId: number; }) => card.columnId === this.columnId)
          const positions = filteredCards.map((card: any) => card.position);
          this.position = positions.length ? Math.max(...positions) + 1 : 1;
        },
        error: (error) => {
          console.error('Erro ao obter posição:', error);
        }
      });
    }
  }

  submitForm() {
    if (this.card) {
      const UPDATE_CARD_MUTATION = `
        mutation UpdateCard($id: Int!, $data: UpdateCardInput!) {
          updateCard(id: $id, data: $data) {
            title
            description
          }
        }
      `;

      const updatedCard = {
        title: this.name,
        description: this.description
      };

      this.graphqlService.mutate(UPDATE_CARD_MUTATION, { id: this.card.id, data: updatedCard }).subscribe({
        next: (result: { data: { updateCard: any; }; }) => {
          window.location.reload();
          this.modalRef.destroy(result.data.updateCard);
        },
        error: (error: any) => {
          console.error('Erro ao editar tarefa:', error);
        }
      });
    } else {
      const CREATE_CARD_MUTATION = `
        mutation CreateCard($data: CreateCardInput!) {
          createCard(data: $data) {
            id
            title
            description
            position
            columnId
          }
        }
      `;
          
      const newCard = {
        title: this.name,
        description: this.description,
        position: this.position,
        columnId: this.columnId,
      };
      
      this.graphqlService.mutate(CREATE_CARD_MUTATION, { data: newCard })
      .subscribe({
        next: (result: { data: { createCard: any; }; }) => {
          console.log('foi')
            window.location.reload();
            this.modalRef.destroy(result.data.createCard);
          },
          error: (error: any) => {
            console.error('Erro ao criar tarefa:', error);
          }
        });
    }
  }
}