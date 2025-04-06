import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import{ColunaComponent} from '../coluna/coluna.component';
import{NavBarraComponent}from'../navbarra/navBar.component';


@Component({
  selector: 'app-home',
  imports: [CommonModule,ColunaComponent,NavBarraComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}

