import {
	Component,
	type ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
	selector: 'ui-input',
	imports: [FormsModule, ReactiveFormsModule],
	templateUrl: './ui-input.component.html',
	styleUrl: './ui-input.component.scss',
})
export class UiInputComponent {
	@ViewChild('inputRef') inputElement!: ElementRef<HTMLInputElement>;
	@Input() focusOnInit = false;
	@Input() variant: 'default' | 'large' | 'chatbot' = 'default';
	@Input() type: 'text' | 'password' = 'text';
	@Input() placeholder = '';

	@Input() control = new FormControl('');
	@Output() inputValueChange = new EventEmitter<string>();

	onInputChange() {
		this.inputValueChange.emit(this.control.value ?? '');
	}

	setFocus() {
		this.inputElement.nativeElement.focus();
	}

	ngAfterViewInit() {
		if (this.focusOnInit) {
			this.setFocus();
		}
	}
}
