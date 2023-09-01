import { ChampionsFreeComponent } from './../../ChampionsModule/Components/champions-free/champions-free.component';
import { ChampionModule } from './../../ChampionsModule/champions.module';
import { NavigationModule } from './../../NavigationModule/navigation.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'src/app/NavigationModule/Components/home/home.component';
import { AuthGuard } from 'src/shared/Utils/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../../AuthModule/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'champions',
    loadChildren: () =>
      import('../../ChampionsModule/champions.module').then(
        (m) => m.ChampionModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'novousuario',
    loadChildren: () =>
      import('../../UsersModule/users.module').then(
        (m) => m.UsersModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'free',
    component: ChampionsFreeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
