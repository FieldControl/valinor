import { Routes } from '@angular/router';
import { HomeComponent } from './modules/pages/home/home.component';
import { WorkspaceComponent } from './modules/pages/workspace/workspace.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'workspace',
        component: WorkspaceComponent,
    }
];
