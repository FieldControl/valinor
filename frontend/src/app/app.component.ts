import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ContainerComponent } from './components/container/container.component';
@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  imports: [HeaderComponent, ContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend';
}
