//confiiguração padrão, service injetavel
import { Injectable, UnauthorizedException } from '@nestjs/common';

//arquivos DTO dos Quadros
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

//Database
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { abort } from 'process';


@Injectable()
export class BoardService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Board)private boardRepository: Repository<Board>,
  private userService : UserService) { }

  async isUserAssociatedWithBoard(boardId: number, userId: number){
    const count = await this.boardRepository.count({
      where: {id: boardId,users:{id: userId}}
    })
    if(count === 0){
      throw new UnauthorizedException('User not authorized')
    }
    return true
  }

  //Criando um novo quadro kanban
  async createNewBoard(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.name = createBoardDto.name;
    const user = await this.userService.findOne(userId);
    board.users = [user];
    return this.boardRepository.save(board);
  }

  //correlação dos quadros com o usuario.
  findAllBoardByUserId(userId : number) {      
    return this.boardRepository.find({
      where: {
        users: {id : userId},
      }
    });;
  }

  
  findOne(id: number, userId: number) {
    console.log(`boardId ${id} e user ${userId} chegou no serviço do backend`)
    return this.boardRepository.findOne({
      where: {
        users: {id : userId}, id,
      },
      relations: ['users','columns', 'columns.cards'],
    });
  }

  //atualização no nome do Board Kanban
  async update(id: number,userId : number ,updateBoardDto: UpdateBoardDto) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.update(id, {
      name: updateBoardDto.name,
    }
    );
  }

  //Excluindo o Board
  async remove(id: number, userId: number) {
    await this.isUserAssociatedWithBoard(id, userId);
    return this.boardRepository.delete(id);
  }
}
