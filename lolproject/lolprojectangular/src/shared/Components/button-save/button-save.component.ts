import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '../button-save',
  templateUrl: '../button-save/button-save.component.html',
  styleUrls: ['../button-save/button-save.component.scss']
})
export class ButtonSave {
  @Input() hreflink !: string;
  @Input() iconOn !: boolean;
  @Input() icon !: string;
  @Input() type !: string;
  @Input() content !:string;
  constructor() {
  }
}
