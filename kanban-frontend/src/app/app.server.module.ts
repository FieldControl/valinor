import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { provideServerRendering } from '@angular/platform-server';
import { App } from './app';
import { BoardComponent } from './kanban/pages/board/board.component'; // componente standalone

@NgModule({
  imports: [
    ServerModule,
    App, // standalone component deve ser importado aqui
  ],
  providers: [provideServerRendering()],
  declarations: [
    BoardComponent
  ], // necessário para SSR
})
export class AppServerModule {}