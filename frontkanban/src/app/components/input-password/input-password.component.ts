import { Component, Input } from '@angular/core';
import { InputComponent } from "../input/input.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-input-password',
  imports: [InputComponent, FontAwesomeModule],
  templateUrl: './input-password.component.html',
  styleUrl: './input-password.component.css'
})
export class InputPasswordComponent {
  visible: boolean = false;
  faEye =  faEye;
  faEyeSlash = faEyeSlash;
  type: string = 'password';
  class: string = "text-blue-600 cursor-pointer"
  
  @Input() placeholder?: string;
  @Input() name?: string;
  @Input() value?: string;
  @Input() label?: string;

  toggleVisibility() {
    if (this.type === 'password') {
      this.type = 'text';
    } else {
      this.type = 'password';
    }
    this.visible = !this.visible;
  }
}
