import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProject } from '../../../interfaces/project.interfaces';
import { ProjectService } from '../../../services/projects/project.service';

@Component({
  selector: 'app-update-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-project-form.component.html',
  styleUrls: ['./update-project-form.component.scss'],
})
export class UpdateProjectFormComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() project!: IProject;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();
  @Output() update = new EventEmitter<string>();

  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService
  ) {
    this.registerForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.setFormValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['project']) {
      this.setFormValues();
    }
  }

  setFormValues(): void {
    if (this.project) {
      this.registerForm.patchValue({
        title: this.project.title,
        description: this.project.description,
      });
    }
  }

  get errors() {
    return {
      title: this.registerForm.get('title')?.errors,
      description: this.registerForm.get('description')?.errors,
    };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { title, description } = this.registerForm.value;
      if (title && description) {
        const updatedAt = new Date().toISOString();

        const project: IProject = {
          id: this.project.id,
          title,
          description,
          updatedAt,
          columns: [],
        };
        this.projectService.updateProject(project).subscribe({
          next: (result) => {
            this.registerForm.reset();
            this.toggle.emit();
          },
          error: (error) => {
            console.error('Unable to complete update:', error);
          },
        });
      }
    } else {
      console.error('Invalid form. Check the fields.');
    }
  }
}
