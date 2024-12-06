import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { KanbanComponent } from './app/kanban/kanban.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([{path: '', component: KanbanComponent}]), provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));
