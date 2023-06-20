import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  nome_repositorio: string = ''

  mudar_nome_repositorio(nome_repositorio: string): void{
    this.nome_repositorio = nome_repositorio
  }
  title = 'valinor';
}
