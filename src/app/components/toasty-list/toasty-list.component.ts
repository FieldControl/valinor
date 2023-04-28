import { Component } from '@angular/core';
import { ToastyService } from 'src/app/services/toasty.service';
import { IToasty } from '../toasty/toasty.component';

@Component({
  selector: 'app-toasty-list',
  templateUrl: './toasty-list.component.html',
  styleUrls: ['./toasty-list.component.scss'],
})

export class ToastyListComponent {

  public toasties: IToasty[] = [];

  constructor(private toasty: ToastyService) {
    this.toasty._show.subscribe((data: IToasty[]) => { this.toasties = data; });
  }
}
