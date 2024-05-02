import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BoardEntity } from '../entities/board.entity';

@Injectable()
export class BoardService {
    constructor(
        @InjectRepository(BoardEntity)
        private readonly boardRepository: Repository<BoardEntity>,
    ) {}

    async getAllBoards(): Promise<BoardEntity[]> {
        return this.boardRepository.find();
    }

    async getBoardById(id: number): Promise<BoardEntity | undefined> {
        return this.boardRepository.findOne({ where: { id } });
    }

    async createBoard(board: BoardEntity): Promise<BoardEntity> {
        return this.boardRepository.save(board);
    }

    async updateBoard(id: number, board: BoardEntity): Promise<BoardEntity | undefined> {
        const existingBoard = await this.boardRepository.findOne({ where: { id } });
        if (!existingBoard) {
            return undefined;
        }

        const updatedBoard = { ...existingBoard, ...board };
        return this.boardRepository.save(updatedBoard);
    }

    async deleteBoard(id: number): Promise<void> {
        await this.boardRepository.delete(id);
    }
}