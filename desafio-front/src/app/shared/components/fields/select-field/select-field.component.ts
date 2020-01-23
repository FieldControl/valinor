import { Component, Input } from '@angular/core';

import { SelectOption } from 'models';

import { FieldCommonComponent } from '../field-common.component';


@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.component.html',
})
export class SelectFieldComponent extends FieldCommonComponent {

  @Input() options: SelectOption[];
  @Input() helpText = '';
  @Input() nullLabel = '';

}
