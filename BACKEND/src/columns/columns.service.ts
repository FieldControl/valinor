import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColumnEntity } from './entities/column.entity';
import { Board } from 'src/boards/entities/board.entity';



@Injectable()
export class ColumnsService implements OnModuleInit {
  
  constructor(
    @InjectRepository(ColumnEntity)
    private columnsRepository: Repository<ColumnEntity>,

    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}
  
  
  async onModuleInit(): Promise<ColumnEntity[]> {
    if (await this.columnsRepository.count() == 0) {
      const board = await this.boardRepository.findOne({ where: { id: 1 } });
      
      const columnsData = [
        { title: "Fazer", board },
        { title: "Fazendo", board },
        { title: "Feito", board },
      ];
  
      const createdColumns = [];
  
      for (const columnData of columnsData) {
        const column = new ColumnEntity();
        column.title = columnData.title;
        column.board = columnData.board;
        const savedColumn = await this.columnsRepository.save(column);
        createdColumns.push(savedColumn);
      }
  
      return createdColumns;
    }
  }
  

async update(id: number, updateColumnDto: UpdateColumnDto): Promise<ColumnEntity> {
    const column = await this.columnsRepository.findOne({
        where: { id }
    });
    if (!column) {
        throw new NotFoundException('Column not found');
    }
    if (updateColumnDto.boardId) {
        const board = await this.boardRepository.findOne({
            where: { id: updateColumnDto.boardId }
        });
        if (!board) {
            throw new NotFoundException('Board not found');
        }
        column.board = board;
    }
    Object.assign(column, updateColumnDto);
    return this.columnsRepository.save(column);
}

  async findAll(): Promise<ColumnEntity[]> {
    return await this.columnsRepository.find();
  }

  async findOne(id: number): Promise<ColumnEntity> {
    return await this.columnsRepository.findOne({ where: { id } });    
  }

  

  async remove(id: number): Promise<void> {
    await this.columnsRepository.delete(id);
  }
}
