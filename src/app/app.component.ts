import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostItComponent } from './components/post-it/post-it.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PostItComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Kanban';
}