import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', component: BoardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
