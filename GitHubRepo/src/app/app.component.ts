import { Component } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  primary: ThemePalette = 'primary';
  accent: ThemePalette = 'accent';
  warn: ThemePalette = 'warn';
  title = 'GitHubRepo';
  
}
