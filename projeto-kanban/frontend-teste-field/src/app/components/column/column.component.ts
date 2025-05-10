import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CardComponent } from '../card/card.component';  // O seu componente de card
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-column',
	standalone: true,
	imports: [CommonModule, CardComponent, FormsModule],
	templateUrl: './column.component.html',
    styleUrls: ['./column.component.scss', '../../app.component.scss']

})
export class ColumnComponent {
	@Input() columnTitle: string = '';
	@Input() cards: any[] = [];
	@Input() columnId!: number;
	@Input() columns: any[] = []; // Recebe a lista de colunas do AppComponent

	newCardToggle = false;

	showConfirmColumn = false;
	showModalColumn = false;

	newCard = { title: '', description: '' };

	@Output() addCard = new EventEmitter<{ title: string; description: string; columnId: number; }>();

	onAddCard() {
		this.addCard.emit({
			title: this.newCard.title,
			description: this.newCard.description,
			columnId: this.columnId,
		});

		this.newCardToggle = false;
		this.newCard = { title: '', description: '' };

	}

	@Output() removeCard = new EventEmitter<number>();

	onRemoveCard(cardId: number) {
		this.removeCard.emit(cardId);
	}

	@Output() removeColumn = new EventEmitter<number>();

	onRemoveColumn() {
		this.removeColumn.emit(this.columnId);
		this.showModalColumn = false;
	}

	cancelRemove() {
		this.showModalColumn = false;
	}

	@Output() updateCard = new EventEmitter<any>();

	onUpdateCardEmitted(cardData: any) {
		this.updateCard.emit(cardData);
	}

	@Output() updateColumnTitle = new EventEmitter<{ id: number; title: string }>();

	editModeTitle = false;
	newTitle = '';

	saveTitle() {
		this.updateColumnTitle.emit({ id: this.columnId, title: this.newTitle });
		this.editModeTitle = false;
	}

	cancelEdit() {
		this.newTitle = this.columnTitle;
		this.editModeTitle = false;
	}

	ngOnInit() {
		this.newTitle = this.columnTitle;
	}
}
