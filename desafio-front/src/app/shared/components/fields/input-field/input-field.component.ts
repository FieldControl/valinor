import { Component, Input } from '@angular/core';
import { FieldCommonComponent } from '../field-common.component';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.component.html',
})
export class InputFieldComponent extends FieldCommonComponent {

  @Input() type = 'text';
  @Input() helpText = '';
  @Input() placeholder = '';

  @Input() minLength: number;
  @Input() maxLength: number;
}
