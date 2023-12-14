import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GitsmartComponent } from './pages/gitsmart/gitsmart.component';

const routes: Routes = [{ path: '', component: GitsmartComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
