import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';


@Component({
  imports: [RouterModule],
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css',],
  standalone: true,
})
export class HeaderComponent {
  constructor(private router : Router){}

  //Titulo do Cabeçalho, recebendo valor do seu component pai.
  @Input() title: string = '';


  switchAccount(){
    this.router.navigate(['acesso']); 
  }
}
