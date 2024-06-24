import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProjectService } from '../../../services/projects/project.service';
import { AuthService } from '../../../services/user/auth.service';
import { Observable } from 'rxjs';
import { IUser } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-register-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-project-form.component.html',
  styleUrl: './register-project-form.component.scss',
})
export class RegisterProjectFormComponent {
  errorMessage: string = '';
  user$: Observable<IUser | null> | undefined;

  @Input() showModal: boolean = false;
  @Output() toggle: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  registerForm = new FormGroup({
    title: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
  });

  get errors() {
    return {
      title: this.registerForm.get('title')?.errors,
      description: this.registerForm.get('description')?.errors,
    };
  }

  ngOnInit() {
    this.user$ = this.authService.currentUser$;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { title, description } = this.registerForm.value;
      this.user$?.subscribe((user) => {
        if (user && user.id && title && description) {
          this.projectService
            .createProject(title, description, user.id)
            .subscribe({
              next: (result) => {
                if (result) {
                  this.registerForm.reset();
                  this.toggle.emit();
                } else {
                  console.error('Project creation failed, result is undefined');
                }
              },
              error: (error) => {
                console.error('Unable to complete registration:', error);
                this.errorMessage = String(error);
              },
            });
        } else {
          console.error('Invalid user or form data.');
        }
      });
    } else {
      console.error('Invalid form. Check the fields.');
    }
  }
}
