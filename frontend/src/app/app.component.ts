import { RouterOutlet } from '@angular/router';
import { Component,inject } from '@angular/core';
import { KanbanService } from './services/kanban.service';

import { HeaderComponent } from './components/header/header.component';
import { ColumnComponent } from './components/column/column.component';

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet],
  imports: [HeaderComponent, ColumnComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Frontend';
  columns: { id: number; title: string }[] = []; 

    private kanbanService = inject(KanbanService);
  
      ngOnInit() {
      this.kanbanService.getColumns().subscribe(
        (response) => {
          console.log('Colunas recebidas:', JSON.stringify(response.data.getColumns, null, 2));
          this.columns = response.data.getColumns;
        },
        (error) => {
          console.error("Erro ao buscar colunas:", error);
        }
      );
    }

}
