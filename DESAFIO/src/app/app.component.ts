import { Component } from '@angular/core';



@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  teste :string  = 'teste'
  constructor() {}

  ngOnInit():void {

  }
}
