import { Component, Input } from '@angular/core';

import { FieldCommonComponent } from '../field-common.component';


@Component({
  selector: 'app-checkbox-field',
  templateUrl: './checkbox-field.component.html',
})
export class CheckboxFieldComponent extends FieldCommonComponent {
  @Input() inline: boolean;
}
