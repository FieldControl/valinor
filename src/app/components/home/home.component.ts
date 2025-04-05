import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import{ColunaComponent} from '../coluna/coluna.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule,ColunaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
}
