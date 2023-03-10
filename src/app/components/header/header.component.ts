import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  
  show: boolean = false
  showLinks(){
    const links = document.querySelector('.links')
    links?.classList.toggle('showOn')
  }
}
