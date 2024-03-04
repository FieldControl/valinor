import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [ButtonComponent, RouterLink, MatIconModule, ReactiveFormsModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  @Input() projects: any;
  @Output() projectIdValue = new EventEmitter<string>();
  projectName = new FormControl('');
  project_id?: string;
  popover: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private icon: MatIconRegistry,
    sanitizer: DomSanitizer,
    private apiService: ApiService
  ) {
    this.icon.addSvgIcon('custom-svg-list', sanitizer.bypassSecurityTrustResourceUrl('assets/list-icon.svg'));
    this.icon.addSvgIcon('logo-custom', sanitizer.bypassSecurityTrustResourceUrl('assets/logo.svg'));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.project_id = params['project_id'];
    });
  }

  getProjectId(value: string) {
    this.projectIdValue.emit(value);
  }

  popoverNewProject() {
    this.popover = true;
  }

  createProject() {
    this.apiService.createProject(this.projectName.value).subscribe((res) => {
      console.log('form enviado'), res;
    });
    this.popover = false;
  }
}
