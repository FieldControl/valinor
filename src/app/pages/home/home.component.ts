import { Component, OnInit } from '@angular/core';
import { APPEARD } from 'src/app/animations/appeard.animation';
import { LIST_ANIMATION_LATERAL } from 'src/app/animations/list.animation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [APPEARD, LIST_ANIMATION_LATERAL],
})
export class HomeComponent implements OnInit {
  public state = 'ready';
  public show!: boolean;

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.show = true;
    }, 0);
  }
}
