import { Component, Input } from '@angular/core';

import { FormGroup } from '@ng-stack/forms';


@Component({
  selector: 'app-checkbox-list',
  templateUrl: './checkbox-list.component.html',
})
export class CheckboxListComponent {

  @Input() formGroup: FormGroup;
  @Input() labels: { [ fieldName: string ]: string };
  @Input() label: string;
  @Input() inline: boolean;

  objectKeys = Object.keys;
}
