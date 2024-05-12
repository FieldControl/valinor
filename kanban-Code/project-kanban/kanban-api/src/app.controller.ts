import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';
import {  CreateBoards } from './dtos/create-board';

@Controller("/a")
export class AppController {

  constructor(
    private prisma: PrismaService,
  ){}

  @Post()
  async createBoard(@Body() body: CreateBoards) {
    const { name, columns } = body;

    const board = await this.prisma.board.create({
      data: {
        name: name,
        columns: {
          create: columns.map(column => ({
            name: column.name,
            boardId: column.boardId
          }))
        }
      },
      include: {
        columns: true,
      }
    });

    return {
      board,
    };
  }
}