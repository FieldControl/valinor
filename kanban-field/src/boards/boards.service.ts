import { Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Board, BoardDocument } from './entities/board.entity';
import { Model } from 'mongoose';
import { ColumnsService } from '../columns/columns.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BoardsService {

  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>,
              @Inject(forwardRef(() => ColumnsService))
              private columnsService: ColumnsService,
              private userService: UsersService) {}

async create(createBoardDto: CreateBoardDto, userId: string) {
  try {
    const board = new this.boardModel({...createBoardDto, responsibles: [userId]});
    return await board.save();
  } catch (error) {
    throw new Error(`Falha ao criar o quadro: ${error.message}`);
  }
}

async createbyMail(createBoardDto: CreateBoardDto, userEmail: string) { // cria boards atribuindo os emails em responsibles
  try {
    let responsibles = [];
    if (createBoardDto.responsibles) {
      responsibles = await Promise.all(createBoardDto.responsibles.map(email => this.userService.findByMail(email)));
    }
    const responsibleIds = [...new Set(responsibles.map(user => user._id.toString()))];

    if (!responsibleIds.includes(userEmail)) {
      responsibleIds.push(userEmail);
    }
    
    const board = new this.boardModel({...createBoardDto, responsibles: responsibleIds});
    return await board.save();
  } catch (error) {
    throw new Error(`Falha ao criar o quadro: ${error.message}`);
  }
}

async findAll(userId: string) {
  try {
    const boards = await this.boardModel.find({ responsibles: { $in: [userId] } });
    const boardsWithColumms = await Promise.all(boards.map(async (board) => {
      board.columns = await this.columnsService.find({ board: board._id }, userId);
      return board;
    }));


    return boardsWithColumms;
  } catch (error) {
    throw new Error(`Falha ao consultar todos os quadros ${error.message}`);
  }
}

async findOne(id: string, userId: string) {
  const board = await this.boardModel.findById({_id: id, responsibles: { $in: [userId] } });
  
  if (!board) {
    throw new NotFoundException('Quadro não encontrado');
  }
  
  board.columns = await this.columnsService.find({ board: id }, userId );
  
  if (board.responsibles.includes(userId)) {
    return board; // retorna o quadro e as colunas pertencentes a ele
  }

    throw new UnauthorizedException();
}

async findBoard(id: string, userId: string) {  //  usado so pra pegar o id no createColumn
  const board = await this.boardModel.findOne({ _id: id, responsibles: { $in: [userId] } });
  
  if (!board) {
    throw new NotFoundException('Quadro não encontrado');
  }
  
  return board;
}

async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {  
  const board = await this.boardModel.findByIdAndUpdate(
    {_id: id, responsibles: { $in: [userId] } }, updateBoardDto, { new: true }
  )

  if (!board) {
    throw new NotFoundException('Quadro não encontrado');
  }

  return board
}

async updateResponsiblesByEmail(id: string, updateBoardDto: UpdateBoardDto, userEmail: string) { // atualiza boards atribuindo os emails em responsibles
  try {
    if (!updateBoardDto.responsibles || updateBoardDto.responsibles.length === 0) {
      throw new Error('Pelo menos um responsável deve ser fornecido');
    }

    const responsibles = await Promise.all(updateBoardDto.responsibles.map(email => this.userService.findByMail(email)));
    const responsibleIds = [...new Set(responsibles.map(user => user['_id'].toString()))];
    
    const board = await this.boardModel.findByIdAndUpdate(
      {_id: id, responsibles: { $in: [userEmail] } },
      {...updateBoardDto, responsibles: responsibleIds},
      { new: true }
    );

    if (!board) {
      throw new NotFoundException('Quadro não encontrado');
    }

    return board;
  } catch (error) {
    throw new Error(`Falha ao atualizar o quadro: ${error.message}`);
  }
}


async remove(id: string, userId: string) {
  const board = await this.boardModel.findByIdAndDelete({_id: id, responsibles: { $in: [userId] } });
  
  if (!board) {
    throw new NotFoundException('Quadro não encontrado');
  } 

  return board
}
}
