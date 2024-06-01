import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './componentes/navigation/navigation.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HomeComponent } from './componentes/home/home.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HomeComponent,NavigationComponent,DragDropModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'kanban';
}
