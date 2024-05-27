// src/cards/cards.controller.ts

import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('cli')
  getCli(): string[] {
    return this.cardsService.getCli();
  }

  @Post('cli')
  addCli(@Body('cliente') cliente: string): void {
    this.cardsService.addCli(cliente);
  }

  @Delete('cli/:index')
  removeCli(@Param('index') index: number): void {
    this.cardsService.removeCli(index);
  }

  @Get('negociacao')
  getNegociacao(): string[] {
    return this.cardsService.getNegociacao();
  }

  @Post('negociacao')
  addNegociacao(@Body('pedido') pedido: string): void {
    this.cardsService.addNegociacao(pedido);
  }

  @Delete('negociacao/:index')
  removeNegociacao(@Param('index') index: number): void {
    this.cardsService.removeNegociacao(index);
  }

  @Get('concluida')
  getConcluida(): string[] {
    return this.cardsService.getConcluida();
  }

  @Post('concluida')
  addConcluida(@Body('pedido') pedido: string): void {
    this.cardsService.addConcluida(pedido);
  }

  @Delete('concluida/:index')
  removeConcluida(@Param('index') index: number): void {
    this.cardsService.removeConcluida(index);
  }

  @Get('entrega')
  getEntrega(): string[] {
    return this.cardsService.getEntrega();
  }

  @Post('entrega')
  addEntrega(@Body('pedido') pedido: string): void {
    this.cardsService.addEntrega(pedido);
  }

  @Delete('entrega/:index')
  removeEntrega(@Param('index') index: number): void {
    this.cardsService.removeEntrega(index);
  }
}
