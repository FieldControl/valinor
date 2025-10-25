import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
	selector: 'ui-button',
	imports: [],
	templateUrl: './ui-button.component.html',
	styleUrl: './ui-button.component.scss',
})
export class UiButtonComponent {
	@Input() style: Partial<CSSStyleDeclaration> = {};
	@Input() btnType: 'button' | 'submit' | 'reset' = 'button';
	@Input() variant: 'default' | 'outline' | 'ghost' | 'muted' = 'default';
	@Input() size: 'default' | 'icon' | 'fullWidth' = 'default';
	@Output() onClick = new EventEmitter<Event>();
  @Input() disabled = false

	handleClick(event: Event) {
		this.onClick.emit(event);
	}
}
