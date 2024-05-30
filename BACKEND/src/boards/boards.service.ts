import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService implements OnModuleInit {
  // Construtor para injetar o repositório de boards
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  // Método para criar uma nova boards
  async onModuleInit(): Promise<Board> {
    if (await this.boardsRepository.count() == 0){
      const boards = new Board();
      boards.title = 'kanban';
      return await this.boardsRepository.save(boards);
    }
  }

  // Método para encontrar todas as boardss
  async findAll(): Promise<Board[]> {
    return await this.boardsRepository.find();
  }

  // Método para encontrar uma boards pelo ID
  async findOne(id: number): Promise<Board> {
    const boards = await this.boardsRepository.findOne({ where: { id } });
    if (!boards) {
      throw new NotFoundException(`Boards with ID ${id} not found`);
    }
    return boards;
  }
  
  // Método para atualizar uma boards
  async update(id: number, updateBoardsDto: UpdateBoardDto): Promise<Board> {
    await this.boardsRepository.update(id, updateBoardsDto);
    const updatedBoards = await this.findOne(id);
    if (!updatedBoards) {
      throw new NotFoundException(`Boards with ID ${id} not found`);
    }
    return updatedBoards;
  }

  // Método para remover uma boards
  async remove(id: number): Promise<void> {
    const boards = await this.findOne(id);
    if (!boards) {
      throw new NotFoundException(`Boards with ID ${id} not found`);
    }
    await this.boardsRepository.delete(id);
  }
}
