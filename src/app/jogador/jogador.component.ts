import { Component, OnInit } from '@angular/core';
import { JogadorService } from './services/jogador.service';

@Component({
  selector: 'app-jogador',
  templateUrl: './jogador.component.html',
  styleUrls: ['./jogador.component.css']
})
export class JogadorComponent implements OnInit{
  artilheiro!: any;
  ngOnInit(): void {
    this.artilheiro = this.jogadorService.getJogador();
  }
  constructor(private jogadorService:JogadorService) { }
}

