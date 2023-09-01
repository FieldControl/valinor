import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '../button-access-login',
  templateUrl: '../button-access-login/button-access-login.component.html',
  styleUrls: ['../button-access-login/button-access-login.component.scss']
})
export class ButtonAccessComponent {
  @Output() buttonClick = new EventEmitter<void>();

  constructor() {

  }

  emitButtonClickEvent() {
    this.buttonClick.emit();
  }

}
