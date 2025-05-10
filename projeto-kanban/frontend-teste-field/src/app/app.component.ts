import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ColumnComponent } from './components/column/column.component';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, ColumnComponent, FormsModule],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})

export class AppComponent implements OnInit {
	private apollo = inject(Apollo);

	newColumn = { title: '' };

	cards: any[] = [];
	columns: any[] = [];

	handleAddCard(event: { title: string, description: string, columnId: number }) {

		if (!event.title || !event.columnId) return;

		this.apollo.mutate({
			mutation: gql`
				mutation CreateCard($createCardInput: CreateCardInput!) {
					createCard(createCardInput: $createCardInput) {
						id
						title
						description
						columnId
					}
				}
			`,
			variables: {
				createCardInput: {
					title: event.title,
					description: event.description,
					columnId: event.columnId
				}
			}
		}).subscribe((result: any) => {
			const newCard = result.data.createCard;
			const column = this.columns.find(c => c.id === Number(event.columnId));
			column?.cards.push(newCard);
		});
	}

	handleAddColumn(title: string) {
		if (!title) return;

		this.apollo.mutate({
			mutation: gql`
				mutation CreateColumn($createColumnInput: CreateColumnKanbanInput!) {
					createColumn(createColumnInput: $createColumnInput) {
						id
						title
					}
				}
			`,
			variables: {
				createColumnInput: {
					title: title,
				}
			}
		}).subscribe((result: any) => {

			const column = result.data.createColumn;

			this.columns.push({
				...column,
				cards: []
			});

		});
		this.newColumn.title = "";
	}

	handleRemoveCard(cardId: number) {

		this.apollo.mutate({
			mutation: gql`
				mutation removeCard($removeCardInput: RemoveCardInput!) {
					removeCard(removeCardInput: $removeCardInput) {
						id
						title
						description
						columnId
					}
				}
			`,
			variables: {
				removeCardInput: {
					id: cardId
				}
			}
		}).subscribe((result: any) => {

			this.columns = this.columns.map(column => {
				return {
					...column,
					cards: column.cards.filter((card: { id: number; }) => card.id !== cardId)
				};
			});


		});


	}

	handleRemoveColumn(columnId: number) {

		this.apollo.mutate({
			mutation: gql`
				mutation removeColumn($removeColumnInput: DeleteColumnKanbanInput!) {
					removeColumn(removeColumnInput: $removeColumnInput) {
						id
						title
					}
				}
			`,
			variables: {
				removeColumnInput: {
					id: columnId
				}
			}
		}).subscribe((result: any) => {
			this.columns = this.columns.filter((column: { id: number; }) => column.id !== columnId)
		});

	}

	handleUpdateCard(event: { id: number; title: string; description: string; columnId: number; }) {

		this.apollo.mutate({
			mutation: gql`
				mutation updateCard($updateCardInput: UpdateCardInput!) {
					updateCard(updateCardInput: $updateCardInput) {
						id
						title
						description
						columnId
					}
				}
			`,
			variables: {
				updateCardInput: {
					id: event.id,
					title: event.title,
					description: event.description,
					columnId: Number(event.columnId)
				}
			}
		}).subscribe((result: any) => {
			this.columns = this.columns.map(column => {
				let updatedCards = column.cards.filter((card: any) => card.id !== event.id);

				if (column.id === Number(event.columnId)) {
					updatedCards = [...updatedCards, event];
				}

				return {
					...column,
					cards: updatedCards
				};
			});
		});

	}

	handleUpdateColumnTitle(columnUpdate: { id: number; title: string }) {

		this.apollo.mutate({
			mutation: gql`
				mutation updateColumn($updateColumnInput: UpdateColumnKanbanInput!) {
					updateColumn(updateColumnInput: $updateColumnInput) {
						id
						title
					}
				}
			`,
			variables: {
				updateColumnInput: {
					id: columnUpdate.id,
					title: columnUpdate.title
				}
			}
		}).subscribe((result: any) => {
			this.columns = this.columns.map(column =>
				column.id === columnUpdate.id
					? { ...column, title: columnUpdate.title }
					: column
			);
		});


		
	}

	ngOnInit() {
		this.apollo.query({
			query: gql`
				query {
					cards {
						id
						title
						description
						columnId
					}
					columns {
						id
						title
					}
				}
			`
		}).subscribe((result: any) => {
			this.cards = [...result.data.cards];
			this.columns = result.data.columns.map((column: any) => ({
				...column,
				cards: this.cards.filter((card: any) => card.columnId === column.id)
			})).sort((a: any, b: any) => a.id - b.id);
		});
	}
}
