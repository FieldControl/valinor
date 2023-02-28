import { Component } from '@angular/core';
import { ChooseComponent } from '../choose/choose.component';

@Component({
  selector: 'app-choose-header',
  templateUrl: './choose-header.component.html',
  styleUrls: ['./choose-header.component.scss']
})
export class ChooserComponent {
  constructor(public ChooseComponent: ChooseComponent) { }

}
