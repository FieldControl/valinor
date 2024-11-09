/* eslint-disable prettier/prettier */
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';

import { Card } from './card/card';

import { ListService } from './list.service';



@Controller('list')

export class ListController {

  constructor(

    private readonly listService: ListService

  ) {}



  @Get()
  async listarTodos(): Promise<Card[]> {

    return this.listService.listarTodos();

  }

  @Get(':status')
  async listarCardsPorStatus(@Param('status') status: string) {
    return this.listService.listarPorStatus(status);
  }



@Post()

  async criar(@Body() card: Card): Promise<Card> {

    return this.listService.criar(card);

  }



@Get(':id')

  async buscarPorId(@Param('id') id: string): Promise<Card> {

    return this.listService.buscarPorId(id);

  }



@Put(':id')

  async atualizar(@Param('id') id: string, @Body() cardAtualizado: Card): Promise<Card> {

    return this.listService.atualizar(id, cardAtualizado);

  }



@Delete(':id')

  async remover(@Param('id') id: string): Promise<Card> {

    return this.listService.remover(id);

  }



}

