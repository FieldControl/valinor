import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { IBoardCreate } from './DTO/create-board.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { UserId } from 'src/decorators/decorator';

@Controller('boards')
export class BoardsController {
    private readonly _boardService: BoardsService;
    constructor(boardService: BoardsService) {
        this._boardService = boardService;
    }

    @Post()
    @UseGuards(JwtGuard)
    async createBoard(@Body() board: IBoardCreate, @UserId() userId: number) {
        return this._boardService.createBoard(board, userId);
    }
}
