import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { AuthGuard} from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { RegisterPageComponent } from './pages/register-page/register-page.component';

export const routes: Routes = [
  {title: 'Login', path: '', component: LoginPageComponent},
  {title: 'Register', path: 'register', component: RegisterPageComponent},
  {title:'Home', path: 'home', component: BoardPageComponent,canActivate: [ AuthGuard ]},
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
