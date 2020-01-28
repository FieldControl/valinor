import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-field-error',
  templateUrl: './field-error.component.html',
})
export class FieldErrorComponent {

  @Input() control: FormControl;
  @Input() errorMsgs = {};

  // Function references for the HTML template
  ObjectKeys = Object.keys;

}
