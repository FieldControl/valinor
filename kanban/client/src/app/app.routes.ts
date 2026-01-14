import { Routes } from '@angular/router';
import { BoardListComponent } from './features/board-list/board-list.component';
import { BoardDetailComponent } from './features/board-detail/board-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'boards', pathMatch: 'full' },
  { path: 'boards', component: BoardListComponent },
  { path: 'boards/:id', component: BoardDetailComponent },
  { path: '**', redirectTo: 'boards' },
];
