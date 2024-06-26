import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateColumnsComponent } from './components/columns/create-columns/create-columns.component';
import { ListColumnsComponent } from './components/columns/list-columns/list-columns.component';
import { CreateCardsComponent } from './components/cards/create-cards/create-cards.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'listColumns',
    pathMatch: 'full'
  },
  {
    path: 'createColumns',
    component: CreateColumnsComponent
  },
  {
    path: 'listColumns',
    component: ListColumnsComponent
  },
  {
    path: 'createCards/:columnId/cards',
    component: CreateCardsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
