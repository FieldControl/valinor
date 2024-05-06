import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KanbansComponent } from './kanbans/kanbans.component';
import { CreateKanbanComponent } from './create-kanban/create-kanban.component';
import { UpdateKanbanComponent } from './update-kanban/update-kanban.component';
const routes: Routes = [
  {
    path: '',
    component: KanbansComponent
  },
  {
    path: 'kanban/create',
    component: CreateKanbanComponent
  },
  {
    path: 'kanban/update',
    component: UpdateKanbanComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
