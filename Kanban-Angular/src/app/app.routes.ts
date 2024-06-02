import { RedirectCommand, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { BoardListComponent } from './components/board-list/board-list.component';

export const routes: Routes = [
    {
        path:"register",
        component:RegisterComponent
    },
    {
        path:"login",
        component:LoginComponent
    },
    {
        path:"boards",
        component:BoardListComponent,
        canActivate: [authGuard],
    },
    {
        path:"boards/:id",
        component:HomeComponent,
        canActivate: [authGuard],
    },
    {
        path:"**",
        redirectTo:"login"
    }
   
];
