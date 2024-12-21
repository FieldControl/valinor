import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.css'
})
export class InputComponent {
  @Input() name?: string;
  @Input() type?: string;
  @Input() placeholder?: string;
  @Input() label?: string;
  @Input() required?: boolean;
  @Input() class?: string;
  @Input() value?: string;
  fullclass = `w-full font-normal p-1 border-blue-300 border-solid border-2 rounded-md hover:border-blue-600 focus:border-blue-800 focus:shadow-2xl text-sm bg-white ${this.class}`;
}
