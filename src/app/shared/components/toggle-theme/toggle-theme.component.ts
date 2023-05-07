import { Component } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-toggle-theme',
  templateUrl: './toggle-theme.component.html',
  styleUrls: ['./toggle-theme.component.scss'],
})
export class ToggleThemeComponent {
  constructor(public themeService: ThemeService) {}
}
