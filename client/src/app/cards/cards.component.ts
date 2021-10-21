import { Component, Input, OnInit } from '@angular/core';
import { Repository } from '../models/repository.model';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
})
export class CardsComponent implements OnInit {
  @Input() items!: Repository[];

  constructor() {}

  ngOnInit(): void {}
}
