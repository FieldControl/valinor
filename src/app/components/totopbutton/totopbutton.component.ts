import { Component } from '@angular/core';

@Component({
  selector: 'app-totopbutton',
  templateUrl: './totopbutton.component.html'
})
export class TotopbuttonComponent {
  totop(){
    window.scroll(0,0)
  }
}
