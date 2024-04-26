import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainComponent } from './pages/main/main.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainComponent],
  template: `<app-main />`
})
export class AppComponent {

}
