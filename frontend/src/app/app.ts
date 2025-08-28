import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Apollo, gql } from 'apollo-angular';

type Card = { id: string; title: string; };
type Column = { id: string; name: string; cards: Card[]; };

const GET_COLUMNS = gql`
  query GetColumns {
    columns { id name cards { id title } }
  }
`;

const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) { id title }
  }
`;

const MOVE_CARD = gql`
  mutation MoveCard($input: MoveCardInput!) {
    moveCard(input: $input)
  }
`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, DragDropModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  columns = signal<Column[]>([]);
  dropListIds = computed(() => this.columns().map(c => c.id));

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.reload();
  }


  private toMutableColumns(cols: Column[]): Column[] {
    return cols.map(col => ({
      ...col,
      cards: col.cards.map(card => ({ ...card })),
    }));
  }

  reload(): void {
    this.apollo
      .watchQuery<{ columns: Column[] }>({ query: GET_COLUMNS })
      .valueChanges
      .subscribe(({ data }) => {

        this.columns.set(this.toMutableColumns(data.columns));
      });
  }

  async addCard(columnId: string, title: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;


    const local = this.columns().map(c =>
      c.id === columnId
        ? ({ ...c, cards: [...c.cards, { id: 'temp-' + Math.random().toString(36).slice(2), title: trimmed }] })
        : c
    );
    this.columns.set(local);

    try {
      await this.apollo.mutate({
        mutation: CREATE_CARD,
        variables: { input: { columnId, title: trimmed } },
        refetchQueries: [{ query: GET_COLUMNS }],
      }).toPromise();
    } catch (e) {
      console.error(e);
      this.reload();
    }
  }

  trackByCardId = (_: number, c: Card) => c.id;

  async onDrop(event: CdkDragDrop<Card[]>, destColumn: Column): Promise<void> {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

  
    this.columns.set(this.columns().map(c => ({ ...c, cards: [...c.cards] })));

    const movedCard = event.container.data[event.currentIndex];
    try {
      await this.apollo.mutate({
        mutation: MOVE_CARD,
        variables: { input: { cardId: movedCard.id, toColumnId: destColumn.id, newIndex: event.currentIndex } },
        refetchQueries: [{ query: GET_COLUMNS }],
      }).toPromise();
    } catch (e) {
      console.error(e);
      this.reload();
    }
  }
}
