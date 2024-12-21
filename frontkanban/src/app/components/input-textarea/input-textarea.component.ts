import { Component, Input } from '@angular/core';
import { InputComponent } from "../input/input.component";

@Component({
  selector: 'app-input-textarea',
  imports: [InputComponent],
  templateUrl: './input-textarea.component.html',
  styleUrl: './input-textarea.component.css'
})
export class InputTextareaComponent {
  @Input() value?:string 
}
