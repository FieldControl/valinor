import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: '../base-component',
  templateUrl: '../base-component/base-component.component.html',
  styleUrls: ['../base-component/base-component.component.scss']
})
export class BaseComponent {

  formCreate?: FormGroup
  stateForm: string = 'create'
  loading: Boolean = false

  constructor() {

  }


}
