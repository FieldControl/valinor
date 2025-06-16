// app.routes.ts
import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login";
import { RegisterComponent } from "./register/register";
import { BoardListComponent } from "./board-list/board-list";
import { BoardDetailComponent } from "./board-detalhes/board-detalhes";

export const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'boards', component: BoardListComponent },
  { path: 'board/:id', component: BoardDetailComponent },
  { path: '**', redirectTo: '' }
];