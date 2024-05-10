import { Routes } from '@angular/router';
import { ColumnComponent } from '../../../../../Kanbans/client/src/app/column/column.component';
import { CardComponent } from './card/card.component';

export const routes: Routes = [
  { path: '', redirectTo: '/columns', pathMatch: 'full' }, // Redireciona para a página de colunas por padrão
  { path: 'columns', component: ColumnComponent }, // Rota para exibir as colunas
  { path: 'cards', component: CardComponent }, // Rota para exibir os cards
  { path: '**', redirectTo: '/columns' } // Redireciona para a página de colunas se a rota não for encontrada
];
