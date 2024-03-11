import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Column } from 'src/interfaces/column.interface';
import { Project } from 'src/interfaces/project.interface';

@Injectable()
export class ColumnService {
  constructor(
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
  ) {}

  async createColumn(body: Column): Promise<{ message: string }> {
    try {
      const projectSearch = await this.projectModel
        .findById(body._id_project)
        .exec();
      if (!projectSearch) {
        return {
          message: `Coluna não pode ser criada, projeto: ${body._id_project} não existe.`,
        };
      }

      const numberOfColumns = await this.columnModel.countDocuments();
      if (numberOfColumns >= 10) {
        return {
          message: `Coluna não pode ser criada, número maximo de colunas atingida`,
        };
      }

      new this.columnModel(body).save();
      return { message: `Coluna criada!` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async getByIdColumns(
    projectId: string,
    columnId: string,
  ): Promise<Column | { message: string }> {
    try {
      return await this.columnModel
        .findOne({ _id_project: projectId, _id: columnId })
        .exec();
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async getAllColumns(
    projectId: string,
  ): Promise<Column[] | { message: string }> {
    try {
      const columns = await this.columnModel
        .find({ _id_project: projectId })
        .exec();
      if (columns.length === 0) {
        return {
          message: `Não existe colunas no projeto id: ${projectId}`,
        };
      }
      return columns;
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}}`,
      };
    }
  }

  async renameColumn(
    columnId: string,
    body: Column,
  ): Promise<{ message: string }> {
    try {
      await this.columnModel.updateOne(
        { _id: columnId },
        { title: body.title },
      );
      return { message: `Coluna ${columnId} renomeada!` };
    } catch (error) {
      return {
        message: `Coluna ${columnId} renomeada!`,
      };
    }
  }
  // Aplicar logica para deletar todas as tasks desta coluna
  async deleteColumn(columnId: string): Promise<{ message: string }> {
    try {
      await this.columnModel.deleteOne({ _id: columnId });
      return {
        message: `Coluna deletada!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro ${error}`,
      };
    }
  }
}
