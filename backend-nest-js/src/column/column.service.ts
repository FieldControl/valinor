//confiiguração padrão, service injetavel
import { Injectable, UnauthorizedException } from '@nestjs/common';

//arquivos DTO das Colunas
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

//Database
import { InjectRepository } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ColumnService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Columns) private columnRepository : Repository<Columns>,
private userService : UserService){}

  //Criando nova coluna 
  async createNewColumn(createColumnDto: CreateColumnDto, userId: number) {
    const column = new Columns();
    column.name = createColumnDto.name;
    column.order = createColumnDto.order;
    column.boardId = createColumnDto.boardId;
    const isConnected = await this.userService.isConnectedToBoard(userId, column.boardId,);
    if(!isConnected){
      throw new UnauthorizedException('você não tem acesso à este quadro')
    }
    return this.columnRepository.save(column);
  }

  async hasAccessToColumn(columnId: number, userId: number){
    const hasAccess = await this.columnRepository.count({
      where: {
        id: columnId,
        board: {users:{id: userId}}
      }
    })

    if(hasAccess > 0){
      return true
    }
  }

  //buscando todas as colunas por quadro
  findAllByBoardId(boardId : number, userId: number) {
    return this.columnRepository.find({
      where: {
        boardId, board:{
          users: {id: userId}
        }
      }
    });
  }

  update(id: number, updateColumnDto: UpdateColumnDto, userId: number) {
    return this.columnRepository.update({
      id, 
        board: {
          users: {id: userId}}},
          {
      name: updateColumnDto.name,
      order: updateColumnDto.order
    });
  }

  //JWT boqueará esse serviço caso usuário que solicita-lo não for criador do quadro.
  remove(id: number, userId: number) {
    return this.columnRepository.delete({id, board:{
      users: {id: userId}
    }});
  }
}
