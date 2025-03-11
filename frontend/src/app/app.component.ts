import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { ContainerComponent } from './components/container/container.component';
import { ColumnComponent } from './components/column/column.component';
// import { CardComponent } from './components/card/card.component';
@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  imports: [HeaderComponent, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend';
  columns = [
    { title: 'A Fazer', cards: ['Tarefa 1', 'Tarefa 2'] },
    { title: 'Em Progresso', cards: ['Tarefa 3'] },
    { title: 'Concluído', cards: ['Tarefa 4', 'Tarefa 5'] }
  ];
}
