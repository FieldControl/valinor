import { Injectable } from '@nestjs/common';

@Injectable()
export class CardsService {
  private cli: string[] = [];
  private negociacao: string[] = [];
  private concluida: string[] = [];
  private entrega: string[] = [];

  getCli(): string[] {
    return this.cli;
  }

  getNegociacao(): string[] {
    return this.negociacao;
  }

  getConcluida(): string[] {
    return this.concluida;
  }

  getEntrega(): string[] {
    return this.entrega;
  }

  addCli(cliente: string): void {
    this.cli.push(cliente);
  }

  removeCli(index: number): void {
    this.cli.splice(index, 1);
  }
  addNegociacao(pedido: string): void {
    this.negociacao.push(pedido);
}

removeNegociacao(index: number): void {
    this.negociacao.splice(index, 1);
}

addConcluida(pedido: string): void {
    this.concluida.push(pedido);
}

removeConcluida(index: number): void {
    this.concluida.splice(index, 1);
}

addEntrega(pedido: string): void {
    this.entrega.push(pedido);
}

removeEntrega(index: number): void {
    this.entrega.splice(index, 1);
}


}
