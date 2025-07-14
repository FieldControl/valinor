// ARQUIVO: src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth-guard';
import { Home } from './components/home/home';

/**
 * A constante 'routes' define a configuração de roteamento para a aplicação.
 * É um array de objetos, onde cada objeto representa uma rota.
 */
export const routes: Routes = [
  {
    // Quando a URL for '/login', o Angular irá renderizar o LoginComponent.
    // Esta rota é pública e não tem nenhuma proteção.
    path: 'login',
    component: LoginComponent
  },
  {
    // Quando a URL for '/kanban', o Angular irá renderizar o componente Home.
    path: 'kanban',
    component: Home,
    // 'canActivate' é a propriedade que protege a rota. Ela recebe um array de "guardas".
    // Antes de carregar o componente Home, o Angular irá executar o nosso 'authGuard'.
    // Se o guarda retornar 'true', o acesso é permitido. Se retornar 'false', o acesso é bloqueado.
    canActivate: [authGuard]
  },
  {
    // Esta é a rota padrão. Se o utilizador aceder à raiz do site (ex: http://localhost:4200/),
    // ele será automaticamente redirecionado para a rota '/kanban'.
    path: '',
    redirectTo: '/kanban',
    pathMatch: 'full' // 'full' significa que a URL deve ser exatamente '' para que o redirecionamento aconteça.
  },
  {
    // Esta é a rota "catch-all" ou "wildcard".
    // Se o utilizador digitar qualquer URL que não corresponda às rotas acima (ex: /pagina-que-nao-existe),
    // ele será redirecionado para '/kanban'.
    path: '**',
    redirectTo: '/kanban'
  }
];