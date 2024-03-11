import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Column } from 'src/interfaces/column.interface';
import { Project } from 'src/interfaces/project.interface';
import { Task } from 'src/interfaces/task.interface';

@Injectable()
export class ColumnService {
  constructor(
    @Inject('PROJECT_MODEL') private projectModel: Model<Project>,
    @Inject('COLUMN_MODEL') private columnModel: Model<Column>,
    @Inject('TASK_MODEL') private taskModel: Model<Task>,
  ) {}

  async createColumn(body: Column): Promise<{ message: string }> {
    try {
      const createColumn = new this.columnModel(body);
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

      await createColumn.save();

      return { message: `Coluna criada!` };
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async getByIdColumns(
    columnId: string,
  ): Promise<Column | { message: string }> {
    try {
      const column = await this.columnModel.findById({
        _id: columnId,
      });

      if (!column) {
        return { message: `Coluna não encontrada` };
      }
      return column;
    } catch (error) {
      return { message: `Ocorreu um erro: ${error}` };
    }
  }

  async getAllColumns(
    projectId: string,
  ): Promise<Column[] | { message: string }> {
    try {
      if (!projectId) {
        return {
          message: 'Requer um ID',
        };
      }
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
    if (!body.title) {
      return { message: `Requer um titulo` };
    }

    try {
      const columnExists = await this.columnModel.findById(columnId);

      if (!columnExists) {
        return { message: `Coluna não encontrada` };
      }

      await this.columnModel.updateOne(
        { _id: columnId },
        { title: body.title },
      );

      return { message: `Coluna renomeada!` };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }

  async deleteColumn(columnId: string): Promise<{ message: string }> {
    try {
      const columnExists = await this.taskModel.findById(columnId);
      if (!columnExists) {
        return { message: `Coluna não encontrada` };
      }

      await this.columnModel.deleteOne({ _id: columnId });
      await this.taskModel.deleteMany({ _id_column: columnId });

      return {
        message: `Coluna deletada!`,
      };
    } catch (error) {
      return {
        message: `Ocorreu um erro: ${error}`,
      };
    }
  }
}
