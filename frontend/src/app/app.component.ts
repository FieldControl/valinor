import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ColumnComponent } from './shared/components/column/column.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule, RouterModule, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
