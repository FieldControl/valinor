import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';


@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, HomeComponent, AboutComponent, ContactComponent]
})
export class AppComponent {
  title = 'frontend-kanban';
  currentPage: string = 'home'; 

  navigateTo(page: string): void {
    this.currentPage = page;
  }
}

