import { Component, Input } from '@angular/core';
import { Cards } from '@type/types';

@Component({
	selector: 'card',
	imports: [],
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss',
})

export class CardComponent {
	@Input() cardData!: Cards;
}
