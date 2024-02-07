import { Component, OnInit } from '@angular/core';
import { ETheme } from '../../enum/ETheme.enum';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  public icon: string = ETheme.ICON_MOON;

  constructor() {}

  ngOnInit(): void {}

  public toggleTheme() {
    const theme = document.body.classList.toggle('light-theme');

    if (theme) {
      return (this.icon = ETheme.ICON_SUN);
    }

    return (this.icon = ETheme.ICON_MOON)
  }
}
