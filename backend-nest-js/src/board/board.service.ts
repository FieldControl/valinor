//confiiguração padrão, service injetavel
import { Injectable } from '@nestjs/common';

//arquivos DTO dos Quadros
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

//Database
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';


@Injectable()
export class BoardService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Board)private boardRepository: Repository<Board>,
  private userService : UserService) { }

  //Criando um novo quadro kanban
  async createNewBoard(createBoardDto: CreateBoardDto, userId: number) {
    const board = new Board();
    board.name = createBoardDto.name;
    const user = await this.userService.findOne(userId);
    board.users = [user];
    return this.boardRepository.save(createBoardDto);
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
    return this.boardRepository.findOne({
      where: {
        users: {id : userId}, id,
      },
      relations: ['users'],
    });
  }

  //atualização no nome do Board Kanban
  update(id: number,userId : number ,updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(
      {
        id,
         users:{id: userId,}}, 
      {
        name : updateBoardDto.name,
      }
    );
  }

  //Excluindo o Board
  remove(id: number, userId: number) {
    return this.boardRepository.delete({
      users: {id : userId}, id,
    });
  }
}
