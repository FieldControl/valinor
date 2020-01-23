import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchAdvancedComponent } from './search-advanced/search-advanced.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchComponent } from './search.component';


const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'busca-avancada', component: SearchAdvancedComponent },
  { path: 'resultados', component: SearchResultsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchRoutingModule { }
