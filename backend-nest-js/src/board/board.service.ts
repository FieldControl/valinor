//confiiguração padrão, service injetavel
import { Injectable } from '@nestjs/common';

//arquivos DTO dos usuarios
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

//Database
import { Board } from './entities/board.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class BoardService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Board)private boardRepository: Repository<Board>,) {  }

  //Criando um novo quadro kanban
  createNewBoard(createBoardDto: CreateBoardDto) {
    const board = new Board();
    board.name = createBoardDto.name;
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

  //preciso implementar lógica para buscar apenas um quadro
  findOne(id: number) {
    return `This action returns a #${id} board`;
  }

  //atualização no nome do Board Kanban
  update(id: number, updateBoardDto: UpdateBoardDto) {
    return this.boardRepository.update(id, 
      {
        name : updateBoardDto.name,
      }
    );
  }

  //Excluindo o Board
  remove(id: number) {
    return this.boardRepository.delete(id);
  }
}
