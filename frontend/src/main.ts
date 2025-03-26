import { AppComponent } from './app/app.component';
import { KanbanComponent } from './app/kanban/kanban.component'
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes), 
  ]
});
