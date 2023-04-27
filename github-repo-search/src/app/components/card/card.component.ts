import { Component, OnInit, Input } from '@angular/core';
import { Repositories } from 'src/app/interfaces/repositories';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() repositories!: Repositories[];
  ngOnInit() {}
}
