import { Component } from '@angular/core';
import { CardsComponent } from '../cards/cards.component';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CardsComponent,CdkDrag],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {


}
