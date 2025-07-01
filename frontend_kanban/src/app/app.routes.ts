import { Routes } from '@angular/router';
import { Card } from './components/card/card';
import { Column } from './components/column/column';
import { Kanban } from './components/kanban/kanban';
import { FormColumn } from './components/form-column/form-column';
import { FormCard } from './components/form-card/form-card';

export const routes: Routes = [
    {path: 'card', component: Card},
    {path: 'column', component: Column},
    {path: 'kanban', component: Kanban},
    {path: 'form-card', component: FormCard},
    {path: 'form-column', component: FormColumn},
    {path: '', redirectTo: 'kanban', pathMatch: 'full'}
];