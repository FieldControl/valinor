import { Routes } from '@angular/router';
import { Card } from './components/card/card';
import { Column } from './components/column/column';
import { Kanban } from './components/kanban/kanban';

export const routes: Routes = [
    {path: 'card', component: Card},
    {path: 'column', component: Column},
    {path: 'kanban', component: Kanban},
    {path: '', redirectTo: 'kanban', pathMatch: 'full'}
];
