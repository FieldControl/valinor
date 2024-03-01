import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [ButtonComponent, RouterLink, MatIconModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  @Input() projects: any;
  @Output() projectIdValue = new EventEmitter<string>();
  project_id?: string;

  constructor(
    private route: ActivatedRoute,
    private icon: MatIconRegistry,
    sanitizer: DomSanitizer,
  ) {
    this.icon.addSvgIcon('custom-svg-list', sanitizer.bypassSecurityTrustResourceUrl('assets/list-icon.svg'));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.project_id = params['project_id'];
    });
  }

  getProjectId(value: string) {
    this.projectIdValue.emit(value);
  }
}
