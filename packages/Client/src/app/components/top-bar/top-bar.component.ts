import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent {
  @Output() novaColuna = new EventEmitter<void>();

  adicionarColuna() {
    console.log("Botão 'Criar Coluna' clicado");
    this.novaColuna.emit();
  }
}
