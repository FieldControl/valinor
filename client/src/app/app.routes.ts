import { Routes } from '@angular/router';
import { Auth } from './auth/auth';
import { Board } from './board/board';

export const routes: Routes = [
    {
        path: '',
        component: Auth,
    },
    {
        path: 'board',
        component: Board
    }
];
