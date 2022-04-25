// Importação de bibliotecas e componentes necessários para o desenvolvimento
import { Component, Input, OnInit } from '@angular/core';
import { RepositorioService } from 'src/app/services/repositorio.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent implements OnInit {
  repositorios: any; // Declarando a variável que irá receber os dados da Api
  constructor(private repositorioService: RepositorioService) {} // Declarando no construtor a Service
  @Input() pesquisa: string; // Variável que irá recever o que foi digitado no input do HTML
  public paginaAtual = 1; // Primeira página na paginação

  Pesquisar() {
    // Função retorna o valor digitado
    return this.pesquisa;
  }

  repositorioRetorna() {
    if (this.Pesquisar() === undefined) {
      // Verificação para ver se o campo não está vazio
      window.alert('Campo vazio, digite um repositório para pesquisar');
    } else {
      // Aqui ele pega a função no repositorioService
      // e envia o valor digitado pelo usuário para ser pesquisado na api
      this.repositorioService.getPesquisa(this.Pesquisar()).subscribe(
        (data: any) => {
          console.log((this.repositorios = data.items));
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  ngOnInit() {}
}
