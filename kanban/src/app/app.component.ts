import { Component } from '@angular/core';
import { ColumnComponent } from "./components/column/column.component";
import { CommonModule } from '@angular/common';
import { Card } from './models/Card.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kanban Filed Control';
}
