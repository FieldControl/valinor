import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @ViewChild('navMenu') navMenu: any;
  teste: string = '';

  menuTest() {
    this.teste = 'slideheader'
    this.navMenu.nativeElement.classList.remove('disable');
    this.navMenu.nativeElement.classList.add('overflow');
  }
}
