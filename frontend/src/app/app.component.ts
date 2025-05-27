import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateColumnComponent } from './components/create-column/create-column.component';
import { ColumnComponent } from "./components/column/column.component";
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateColumnComponent, ColumnComponent, DragDropModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'valinor-frontend';
}
