import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { KanbanComponent } from './pages/kanban/kanban.component';
export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'kanban', component: KanbanComponent }

];
