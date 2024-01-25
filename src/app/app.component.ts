import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NgxSkeletonLoaderModule],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <footer id="footer" class="footer">
      <p>Feito por dants.dev</p>
    </footer>
  `,
})
export class AppComponent {}
