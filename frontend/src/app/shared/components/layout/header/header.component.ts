import { Component } from '@angular/core';

@Component({
	selector: 'board-header',
	imports: [],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class BoardHeaderComponent {
	currentDate = new Date().toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',

	});
}
