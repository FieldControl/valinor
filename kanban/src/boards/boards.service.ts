import { Injectable } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BoardsService {
  constructor(@InjectRepository(Board) private readonly boardsRepository: Repository<Board>) {}
  async create(createBoardDto: CreateBoardDto) {
    return await this.boardsRepository.insert(createBoardDto);
  }

  async findAll() {
    return await this.boardsRepository.find({where: {status: 1}});
  }

  async findOne(id: number) {
    return await this.boardsRepository.findOne({where: {id, status:1}});
  }
  async findAllWhereUserId(userId: number) {
    return await this.boardsRepository.find({where: {userId, status:1}});
  }

  async update(id: number, updateBoardDto: UpdateBoardDto) {
    return await this.boardsRepository.update(id, updateBoardDto);
  }

  async remove(id: number) {
    return await this.boardsRepository.update(id, {status: 0});
  }
}
