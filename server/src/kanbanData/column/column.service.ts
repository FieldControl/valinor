import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from './column.schema'; // Usando o modelo Mongoose
import { CreateColumnInput } from './create-column.input'; // Importando o DTO de criação de coluna
import { ColumnType } from './column.type';

@Injectable()
export class ColumnService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<Column>, // Injetando o modelo Mongoose de Coluna
  ) {}

  // Criar uma nova coluna
  async create(createColumnInput: CreateColumnInput): Promise<Column> {
    const createdColumn = new this.columnModel(createColumnInput); // Criando o documento da coluna
    const savedColumn = await createdColumn.save(); // Salvando no banco de dados
    return savedColumn; // Retornando o modelo Mongoose
  }

  // Buscar todas as colunas
  async findAll(): Promise<ColumnType[]> {
    const columns = await this.columnModel.find().exec(); // Buscando todas as colunas
    return columns.map((column) => ({id: column._id.toString(), name: column.name, color: column.color})) // Retornando as colunas
  }

  // Deletar uma coluna
  async remove(id: string): Promise<boolean> {
    const result = await this.columnModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}