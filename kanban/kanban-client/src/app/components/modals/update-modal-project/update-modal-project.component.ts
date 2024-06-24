import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UpdateProjectFormComponent } from '../../forms/update-project-form/update-project-form.component';
import { IProject } from '../../../interfaces/project.interfaces';

@Component({
  selector: 'app-update-modal-project',
  standalone: true,
  imports: [UpdateProjectFormComponent],
  templateUrl: './update-modal-project.component.html',
  styleUrl: './update-modal-project.component.scss',
})
export class UpdateModalProjectComponent {
  @Input() showModal: boolean = false;
  @Input() project!: IProject;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();

  close() {
    this.toggle.emit();
  }
}
