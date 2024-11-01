import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RegisterProjectFormComponent } from '../../forms/register-project-form/register-project-form.component';

@Component({
  selector: 'app-insert-modal-project',
  standalone: true,
  imports: [RegisterProjectFormComponent],
  templateUrl: './insert-modal-project.component.html',
  styleUrl: './insert-modal-project.component.scss',
})
export class InsertModalProjectComponent {
  @Input() showModal: boolean = false;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();

  close() {
    this.toggle.emit();
  }
}
