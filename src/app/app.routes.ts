import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TypographyPageComponent } from './pages/typography-page/typography-page.component';
import { ColorsPageComponent } from './pages/colors-page/colors-page.component';
import { InputsPageComponent } from './pages/inputs-page/inputs-page.component';
import { ButtonsPageComponent } from './pages/buttons-page/buttons-page.component';
import { TablesPageComponent } from './pages/tables-page/tables-page.component';
import { ItemsPageComponent } from './pages/items-page/items-page.component';
import { IconsPageComponent } from './pages/icons-page/icons-page.component';
import { PipesPageComponent } from './pages/pipes-page/pipes-page.component';
import { GitHubSearchComponent } from './pages/gh-search/gh-search.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'Página Inicial' },
  },
  {
    path: 'typography',
    component: TypographyPageComponent,
    data: { title: 'Tipografia' },
  },
  {
    path: 'colors',
    component: ColorsPageComponent,
    data: { title: 'Cores' },
  },
  {
    path: 'inputs',
    component: InputsPageComponent,
    data: { title: 'Inputs' },
  },
  {
    path: 'buttons',
    component: ButtonsPageComponent,
    data: { title: 'Botões' },
  },
  {
    path: 'tables',
    component: TablesPageComponent,
    data: { title: 'Tabelas' },
  },
  {
    path: 'items',
    component: ItemsPageComponent,
    data: { title: 'Itens' },
  },
  {
    path: 'icons',
    component: IconsPageComponent,
    data: { title: 'Ícones' },
  },
  {
    path: 'pipes',
    component: PipesPageComponent,
    data: { title: 'Pipes' },
  },
  {
    path: 'gh-search',
    component: GitHubSearchComponent,
    data: { title: 'Buscador de Repositório' },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { title: 'Não Encontrado' },
  },
];
