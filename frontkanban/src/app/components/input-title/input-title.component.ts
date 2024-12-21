import { Component, Input } from '@angular/core';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-input-title',
  imports: [InputComponent],
  templateUrl: './input-title.component.html',
  styleUrl: './input-title.component.css'
})
export class InputTitleComponent {
  @Input() value?:string
}
