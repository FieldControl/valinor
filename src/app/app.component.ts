import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardComponent } from './card/card.component';
import { ColumnComponent } from './column/column.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardComponent, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
