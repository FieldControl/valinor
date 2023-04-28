import { Component, Input, OnInit } from '@angular/core';

export interface IToasty {
  text: string;
}

@Component({
  selector: 'app-toasty',
  templateUrl: './toasty.component.html',
  styleUrls: ['./toasty.component.scss'],
})
export class ToastyComponent implements OnInit {
  @Input() data!: IToasty;

  public _show!: boolean;

  constructor() { }

  private show(): void {
    this._show = true;
  }

  private hide(): void {
    this._show = false;
  }

  private start(): void {
    setTimeout(() => { this.show(); }, 0);
    setTimeout(() => { this.hide();  }, 2000);
  }

  ngOnInit() {
    this.start();
  }
}
