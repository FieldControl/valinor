import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { RouterLink } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Project } from '../../models/kanban.model';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [ButtonComponent, RouterLink, MatIconModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  @Output() projectIdValue = new EventEmitter<string>();
  projects!: Project[];
  projectName = new FormControl('');
  project_id!: string;
  modal: boolean = false;

  constructor(private icon: MatIconRegistry, sanitizer: DomSanitizer, private apiService: ApiService) {
    this.icon.addSvgIcon('custom-svg-list', sanitizer.bypassSecurityTrustResourceUrl('assets/list-icon.svg'));
    this.icon.addSvgIcon('logo-custom', sanitizer.bypassSecurityTrustResourceUrl('assets/logo.svg'));
  }

  ngOnInit(): void {
    this.apiService.getAllProjects().subscribe((projectsData) => {
      this.projects = projectsData;
      this.project_id = this.projects[0]._id;
      this.projectIdValue.emit(this.projects[0]._id);
    });
  }

  getProjectId(value: string) {
    this.projectIdValue.emit(value);
  }

  createProject() {
    this.apiService.createProject(this.projectName.value).subscribe((res) => {
      console.log('Projeto criado'), res;
      this.apiService.getAllProjects().subscribe((projectsData) => {
        this.projects = projectsData;
      });
    });
    this.modal = false;
  }

  modalNewProject() {
    this.modal = true;
  }
}
