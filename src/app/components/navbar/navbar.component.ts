import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'src/app/shared/components/svg-icon/svg-icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [SvgIconComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  iconName = 'GitHub';

  constructor(private router: Router) {}

  onClick() {
    this.router.navigate(['/']);
  }
}
