import { Routes } from '@angular/router';

import { Home } from './features/board/pages/home/home';
import { BoardsDetail } from './features/board/pages/board-detail/board-detail';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'board/:id',
    component: BoardsDetail
  }
];
