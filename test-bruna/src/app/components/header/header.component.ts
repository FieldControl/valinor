import { Component } from '@angular/core';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(private searchService: SearchService) { }

  onInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const inputValue = (event.target as HTMLInputElement).value;
      this.searchService.updateSearchQuery(inputValue);
    }
  }

  onClickGithub(): void {
    window.open('https://github.com/brunaporato', '_blank');
  }

  onClickLinkedin(): void {
    window.open('https://linkedin.com/in/brunaporato', '_blank');
  }
}
