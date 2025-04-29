import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Column } from './entities/columns.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

//Criação dos objetos da coluna

@Injectable()
export class ColumnsService implements OnModuleInit {
  constructor(
    @InjectRepository(Column)
    private columnRepository: Repository<Column>,
  ) {}

  async onModuleInit() {
    // Verifica se já existem colunas
    const columns = await this.columnRepository.find();
    
    if (columns.length === 0) {
      // Cria as colunas padrão
      const defaultColumns = [
        { nome: 'A fazer' },
        { nome: 'Em andamento' },
        { nome: 'Concluída' }
      ];

      for (const column of defaultColumns) {
        await this.create(column);
      }
      
      console.log('Colunas padrão criadas com sucesso!');
    }
  }

  create(createColumnDto: CreateColumnDto) {
    const column = this.columnRepository.create(createColumnDto);
    return this.columnRepository.save(column);
  }

  findAll() {
    return this.columnRepository.find({ relations: ['cards'] , order:{id:"ASC"}});
  }

  findOne(id: number) {
    return this.columnRepository.findOne({ where: { id }, relations: ['cards'] });
  }

  update(id: number, updateColumnDto: UpdateColumnDto) {
    return this.columnRepository.update(id, updateColumnDto);
  }

  remove(id: number) {
    return this.columnRepository.delete(id);
  }
}