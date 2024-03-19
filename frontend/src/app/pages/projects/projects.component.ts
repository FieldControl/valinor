import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { ApiService } from '../../services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface IResponse {
  title: string;
  isTemplate: string;
  id: string;
}

@Component({
  selector: 'app-project',
  standalone: true,
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  imports: [MatGridListModule, MatIconModule, ReactiveFormsModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ProjectsComponent implements OnInit {
  @ViewChild('myModal') myModal!: ElementRef;
  projectForm: FormGroup = this.formBuilder.group({
    title: ['', [Validators.required]],
    isTemplate: ['', [Validators.required]],
  });
  showLoginError = false;
  isSubmitting = false;
  projects: IResponse[] = [];

  constructor(private api: ApiService, private formBuilder: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.getProjects();
    setInterval(() => this.getProjects(), 3000);
  }

  getProjects(): void {
    this.api.getProjects().subscribe({
      next: (response) => {
        this.projects = response;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  openModal() {
    this.myModal.nativeElement.style.display = 'block';
  }

  closeModal() {
    this.myModal.nativeElement.style.display = 'none';
  }

  onNavigateToProjectId(id: string): void {
    this.router.navigate(['/project', id]);
  }

  onSubmit() {
    if (!this.projectForm.valid) return;
    this.isSubmitting = true;
    const { ...rest } = this.projectForm.value;

    this.api.project(rest).subscribe({
      next: (response) => {
        this.closeModal();
        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
        this.showLoginError = true;
      },
    });
  }
}
