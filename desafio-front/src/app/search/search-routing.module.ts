import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchAdvancedComponent } from './search-advanced/search-advanced.component';
import { SearchComponent } from './search.component';


const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'busca-avancada', component: SearchAdvancedComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule { }
