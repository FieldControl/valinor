import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DemoNgZorroAntdModule } from '../utils/DemoNgZorroAntdModules';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DemoNgZorroAntdModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  userName = 'John Doe';
  userAvatar = 'path/to/avatar.png';

  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}
