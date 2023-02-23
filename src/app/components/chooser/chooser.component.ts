import { Component } from '@angular/core';
import { ChooseComponent } from '../choose/choose.component';

@Component({
  selector: 'app-chooser',
  templateUrl: './chooser.component.html',
  styleUrls: ['./chooser.component.scss']
})
export class ChooserComponent {
  constructor(public ChooseComponent: ChooseComponent) { }

}
