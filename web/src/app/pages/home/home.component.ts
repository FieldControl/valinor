import { Component } from '@angular/core';

import { Column } from '../../types/column.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  column: Column = {
    id: '1',
    title: 'To-Do',
    createdAt: 'created at',
    updatedAt: 'updated at',
  };
}
