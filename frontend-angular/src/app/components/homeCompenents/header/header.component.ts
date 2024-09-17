import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css',],
  standalone: true,
})
export class HeaderComponent {

  //Titulo do Cabeçalho, recebendo valor do seu component pai.
  @Input() title: string = '';


  logout(){

  }
}
