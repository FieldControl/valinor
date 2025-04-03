import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { routes } from './app.routes';
import { KanbanService } from './services/kanban.service';
import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
import { KanbanColumnComponent } from './components/kanban-column/kanban-column.component';
import { KanbanCardComponent } from './components/kanban-card/kanban-card.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(HttpClientModule), 
    KanbanService, 
    KanbanBoardComponent, 
    KanbanColumnComponent, 
    KanbanCardComponent 
  ]
};
