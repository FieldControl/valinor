import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserId } from 'src/decorators/decorator';
import { JwtGuard } from 'src/guards/jwt.guard';
import { BoardsService } from './boards.service';
import { IBoardCreate, IBoardUpdate } from './DTO/create-board.dto';
import { ColumnService } from 'src/columns/column.service';

@Controller('boards')
export class BoardsController {
    private readonly _boardService: BoardsService;
    private readonly _columnService: ColumnService;
    constructor(boardService: BoardsService, columnService: ColumnService) {
        this._boardService = boardService;
        this._columnService = columnService;
    }

    @Get()
    @UseGuards(JwtGuard)
    async getAllBoards(@UserId() userId: number) {
        return this._boardService.getAllBoards(userId);
    }

    @Get(':id')
    @UseGuards(JwtGuard)
    async getBoardById(@Param('id') id: number) {
        return this._boardService.getBoardById(id);
    }

    @Get(':id/columns')
    @UseGuards(JwtGuard)
    async getColumnsByBoardId(@Param('id') id: number) {
        return this._columnService.getColumnsByBoardId(id);
    }

    @Post()
    @UseGuards(JwtGuard)
    async createBoard(@Body() board: IBoardCreate, @UserId() userId: number) {
        return this._boardService.createBoard(board, userId);
    }

    @Patch(':id')
    @UseGuards(JwtGuard)
    async updateBoard(@Body() board: IBoardUpdate) {
        return this._boardService.updateBoard(board);
    }

    @Delete(':id')
    @UseGuards(JwtGuard)
    async deleteBoard(@Param('id') id: number) {
        return this._boardService.deleteBoard(id);
    }
}