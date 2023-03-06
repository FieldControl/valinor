import { Component, Input } from '@angular/core';
import { Character } from '../Model/Character';

@Component({
  selector: 'app-card-charcacter',
  templateUrl: './card-charcacter.component.html',
  styleUrls: ['./card-charcacter.component.css']
})
export class CardCharcacterComponent {
  
@Input()name: string;

@Input()status: string;
  
@Input()image: string;

@Input()id: number;

}