import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'
import { RouterOutlet } from '@angular/router';
import { KanbanComponent } from "./components/kanban/kanban.component";
import { CreateColumnModalComponent } from './components/create-column-modal/create-column-modal.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, KanbanComponent, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private dialog: MatDialog) {}

  openCreateColumnDialog(): void {
    this.dialog.open(CreateColumnModalComponent);
  }
}
