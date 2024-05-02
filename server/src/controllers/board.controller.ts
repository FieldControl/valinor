import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

import { BoardService } from '../services/board.service';
import { BoardEntity } from '../entities/board.entity';

@Controller('boards')
export class BoardController {
    constructor(private readonly boardService: BoardService) {}

    @Post()
    async create(@Body() board: BoardEntity): Promise<BoardEntity> {
        return this.boardService.createBoard(board);
    }

    @Get()
    async findAll(): Promise<BoardEntity[]> {
        return this.boardService.getAllBoards();
    }

    @Get(':id')
    async findById(@Param('id') id: number): Promise<BoardEntity> {
        return this.boardService.getBoardById(id);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() board: BoardEntity): Promise<BoardEntity> {
        return this.boardService.updateBoard(id, board);
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<void> {
        return this.boardService.deleteBoard(id);
    }
}
