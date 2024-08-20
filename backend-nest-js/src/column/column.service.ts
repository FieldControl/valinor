//confiiguração padrão, service injetavel
import { Injectable } from '@nestjs/common';

//arquivos DTO das Colunas
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

//Database
import { InjectRepository } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ColumnService {

  //importando o Repositorio contendo a coluna User do DataBase SQL.
  constructor(@InjectRepository(Columns) private columnRepository : Repository<Columns>){}

  //Criando nova coluna 
  createNewColumn(createColumnDto: CreateColumnDto) {
    const column = new Columns();
    column.name = createColumnDto.name;
    column.order = createColumnDto.order;
    column.boardId = createColumnDto.boardId;
    return this.columnRepository.save(column);
  }

  //buscando todas as colunas por quadro
  findAllByBoardId(boardId : number) {
    return this.columnRepository.find({
      where: {
        boardId
      }
    });
  }

  update(id: number, updateColumnDto: UpdateColumnDto) {
    return this.columnRepository.update(id,{
      name: updateColumnDto.name,
      order: updateColumnDto.order
    });
  }

  //JWT boqueará esse serviço caso usuário que solicita-lo não for criador do quadro.
  remove(id: number) {
    return this.columnRepository.delete(id);
  }
}
