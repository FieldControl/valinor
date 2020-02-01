import { NgModule } from '@angular/core';
import { Routes, RouterModule, UrlSegment } from '@angular/router';

import { AuthGuard } from 'guards/auth/auth.guard';
import { FeatureRootComponent } from 'feature/feature-root.component';
import { FeatureComponent } from 'feature/pages';
import { ResolverService } from './services';

const defaultRoutes: Routes = [
  {
    path: '', component: FeatureRootComponent, canActivate: [AuthGuard], children: [
      { path: '', component: FeatureComponent, canActivate: [AuthGuard], resolve: { log: ResolverService } },
      // { path: 'new', component: RecipeEditComponent, canActivate: [AuthGuard] },
      // { path: ':id', component: RecipeDetailComponent },
      // { path: ':id/edit', component: RecipeEditComponent, canActivate: [AuthGuard] },
    ]
  },
  // Módulos aninhados devem ser colocados fora para funcionar!
  // { path: 'nested', loadChildren: './modules/feature-nested/feature-nested.module#FeatureNestedModule'},
];


@NgModule({
  imports: [
    RouterModule.forChild(defaultRoutes)
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class FeatureRoutingModule {

}
