import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.css']
})

export class CharacterComponent implements OnInit {
  @Input() character: any = {};
  
  constructor() { }

  ngOnInit() {
  }
}
export interface Character {
  name: string
  thumbnail: string
}