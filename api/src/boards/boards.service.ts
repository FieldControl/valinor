import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { IBoardCreate } from './DTO/create-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
    ) { }

    async createBoard(createBoardDto: IBoardCreate, userId: number): Promise<Board> {
        const board = this.boardRepository.create({
            ...createBoardDto,
            user: { id: userId }
        });

        return this.boardRepository.save(board);
    }
}