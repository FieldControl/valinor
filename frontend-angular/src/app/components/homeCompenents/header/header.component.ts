import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true,
})
export class HeaderComponent {
  
  

  //Titulo do Cabeçalho, recebendo valor do seu component pai.
  @Input() title: string = '';


}
