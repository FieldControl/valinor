import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EmAbertoComponent } from "./em-aberto/em-aberto.component";
import { ConcluidasComponent } from "./concluidas/concluidas.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EmAbertoComponent, ConcluidasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'meu-kanban';
}
