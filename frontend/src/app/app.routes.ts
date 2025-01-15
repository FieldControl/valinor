import { Routes } from '@angular/router';
import { BoardComponent } from './kanban/board/board.component';
import { BoardDetailComponent } from './kanban/board-detail/board-detail.component';

export const routes: Routes = [
    { path: '', component: BoardComponent },
    { path: 'board/:id', component: BoardDetailComponent }
];
