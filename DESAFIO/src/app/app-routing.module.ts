import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/shared/services/guard.service';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import(
        './login/login.page.module'
      ).then((m) => m.LoginPageModule),
  },
  {
    path: 'home',
    loadChildren: () => import(
      './home/home.page.module')
      .then( m => m.HomePageModule),
      canActivate: [AuthGuard],
  },
  {
    path: 'menu',
    loadChildren: () => import(
      './menu/menu.page.module')
      .then( m => m.MenuPageModule),
      canActivate: [AuthGuard],
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
