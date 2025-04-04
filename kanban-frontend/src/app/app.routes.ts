import { Routes } from '@angular/router';
import { BoardComponent } from './componentes/board/board.component';
import { FormComponent } from './componentes/form/form.component';
import { ExcluirComponent } from './componentes/board/excluir/excluir.component';

export const routes: Routes = [
  {
    path: '',
    component: BoardComponent
  },
  {
    path: 'task/new',
    component: FormComponent
  },
  {
    path: 'task/edit/:id',
    component: FormComponent
  },
  {
    path: 'excluir/:id',
    component: ExcluirComponent
  }
];
