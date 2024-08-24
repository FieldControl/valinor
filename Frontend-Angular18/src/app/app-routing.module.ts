import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessAppComponent } from './components/formsComponents/accessApp/access-app.component';


const routes: Routes = [
  { path: 'acesso', component: AccessAppComponent },
  { path: '**', redirectTo: 'acesso'},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
