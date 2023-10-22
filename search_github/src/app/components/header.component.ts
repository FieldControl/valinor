import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  @Input() q: string ='letra q';
  @Input() filtersDisable: boolean = false;
}
