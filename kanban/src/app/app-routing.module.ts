import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainViewComponent } from './pages/main-view/main-view.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: MainViewComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    FormsModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
