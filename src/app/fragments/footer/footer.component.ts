import { Component, OnInit } from '@angular/core';
import { APPEARD } from 'src/app/animations/appeard.animation';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  animations: [APPEARD],
})
export class FooterComponent implements OnInit {
  public state = 'ready';
  
  constructor() { }

  ngOnInit(): void {
  }

}
