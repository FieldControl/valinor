import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument } from './entities/board.entity';
import { Model } from 'mongoose';
import { ColumnsService } from 'src/columns/columns.service';

@Injectable()
export class BoardsService {

  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>,
              private columnsService: ColumnsService) {}

  async create(createBoardDto: CreateBoardDto) {
    try {
      const board = new this.boardModel(createBoardDto);
      return await board.save();
    } catch (error) {
      throw new Error(`Falha ao criar o quadro: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const boards = await this.boardModel.find();
  
      const boardsWithColumms = await Promise.all(boards.map(async (board) => {
        board.columns = await this.columnsService.find({ board: board._id });
        return board;
      }));
  
      return boardsWithColumms;
    } catch (error) {
      throw new Error(`Falha ao consultar todos os quadros ${error.message}`);
    }
  }

  async findOne(id: string) {
    const board = await this.boardModel.findById(id);
    
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    board.columns = await this.columnsService.find({ board: id });
    
    return board; // retorna o quadro e as colunas pertencentes a ele
  }

  async update(id: string, updateBoardDto: UpdateBoardDto) {
    const board = await this.boardModel.findByIdAndUpdate(
      id, updateBoardDto, { new: true }
    )

    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    return board
  }

  async remove(id: string) {
    const board = await this.boardModel.findByIdAndDelete(id);
    
    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    } 

    return board
  }
}
