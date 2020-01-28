import { Input } from '@angular/core';
import { FormControl } from '@angular/forms';


export class FieldCommonComponent {

  @Input() id = '';
  @Input() control: FormControl;
  @Input() fieldName = '';
  @Input() errorMsgs: { [error: string]: string } = {};

}
