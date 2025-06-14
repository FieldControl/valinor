import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { IBoardCreate, IBoardUpdate } from './DTO/create-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
    ) { }

    async getAllBoards(userId: number): Promise<Board[]> {
        return this.boardRepository.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            relations: ['user']
        });
    }

    async getBoardById(id: number): Promise<Board> {
        const board = await this.boardRepository.findOne({
            where: { id },
            relations: ['user']
        });

        if (!board) {
            throw new Error('Board not found');
        }

        return board;
    }

    async createBoard(createBoardDto: IBoardCreate, userId: number): Promise<Board> {
        const board = this.boardRepository.create({
            ...createBoardDto,
            user: { id: userId }
        });

        return this.boardRepository.save(board);
    }

    async updateBoard(board: IBoardUpdate): Promise<Board> {
        const existingBoard = await this.boardRepository.findOneBy({ id: board.id });
        if (!existingBoard) {
            throw new Error('Board not found');
        }

        existingBoard.title = board.title;
        return this.boardRepository.save(existingBoard);
    }

    async deleteBoard(id: number): Promise<void> {
        if (!id) {
            throw new Error('Board ID is required');
        }

        const result = await this.boardRepository.delete(id);
        if (result.affected === 0) {
            throw new Error('Board not found');
        }
    }

}