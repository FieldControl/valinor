import {
  ChangeDetectorRef,
  Component,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { IProject } from '../../interfaces/project.interfaces';
import { ProjectService } from '../../services/projects/project.service';
import { CommonModule } from '@angular/common';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
  projects$: Observable<IProject[]> | undefined;

  constructor(
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.projects$ = this.projectService.projects$;
    this.projectService.projects$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['projects$']) {
      this.projects$ = this.projectService.projects$;
      this.cdr.detectChanges();
    }
  }

  onDeleteProject(projectId: string) {
    this.projectService.deleteProject(projectId).subscribe((success) => {
      if (success) {
        ('Project deleted successfully');
      } else {
        console.error('Failed to delete project');
      }
    });
  }
}
