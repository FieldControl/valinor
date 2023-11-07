import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-informacoes-pokemon',
  templateUrl: './informacoes-pokemon.component.html',
  styleUrls: ['./informacoes-pokemon.component.css']
})
export class InformacoesPokemonComponent {
  @Input() dadosDoPokemon: any;
}
